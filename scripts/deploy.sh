#!/bin/bash
##########################################################
# CPaaS Platform — Full Production Deploy Script
# Usage: ./scripts/deploy.sh [environment] [action]
#   environment: dev | staging | prod (default: dev)
#   action: install | upgrade | uninstall | status | test
#
# Examples:
#   ./scripts/deploy.sh dev install
#   ./scripts/deploy.sh prod upgrade
#   ./scripts/deploy.sh prod test
##########################################################

set -euo pipefail

ENVIRONMENT="${1:-dev}"
ACTION="${2:-upgrade}"
HELM_RELEASE="cpaas"
HELM_CHART="./deployments/helm/cpaas"
VALUES_FILE="./deployments/helm/cpaas/values.yaml"
VALUES_ENV_FILE="./deployments/helm/cpaas/values-${ENVIRONMENT}.yaml"

# ── Colors ──────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_err()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

##########################################################
# STEP 0: Prerequisites Check
##########################################################
check_prerequisites() {
    log_info "Checking prerequisites..."

    command -v kubectl >/dev/null 2>&1 || log_err "kubectl not found"
    command -v helm >/dev/null 2>&1    || log_err "helm not found"
    command -v docker >/dev/null 2>&1  || log_err "docker not found"

    kubectl cluster-info >/dev/null 2>&1 || log_err "Cannot reach Kubernetes cluster"
    log_ok "Prerequisites OK"
}

##########################################################
# STEP 1: Build Docker Images
##########################################################
build_images() {
    log_info "Building Docker images..."

    # Backend (ASP.NET)
    log_info "Building backend..."
    docker build -t cpaas-backend:latest ./backend/
    log_ok "Backend image built"

    # Go Agent
    log_info "Building Go agent..."
    docker build -t cpaas-go-agent:latest ./agent/
    log_ok "Go agent image built"

    # Frontend
    if [ -d "./frontend" ]; then
        log_info "Building frontend..."
        docker build -t cpaas-frontend:latest ./frontend/
        log_ok "Frontend image built"
    fi

    # OpenSIPS custom image
    if [ -d "./deployments/docker/opensips" ]; then
        log_info "Building OpenSIPS image..."
        docker build -t cpaas-opensips:3.5 ./deployments/docker/opensips/
        log_ok "OpenSIPS image built"
    fi

    # FreeSWITCH custom image
    if [ -d "./deployments/docker/freeswitch" ]; then
        log_info "Building FreeSWITCH image..."
        docker build -t cpaas-freeswitch:1.10 ./deployments/docker/freeswitch/
        log_ok "FreeSWITCH image built"
    fi

    log_ok "All images built successfully"
}

##########################################################
# STEP 2: Load Images into K8s (for k3s / minikube)
##########################################################
load_images_to_k8s() {
    log_info "Loading images into Kubernetes..."

    # Detect cluster type
    if command -v k3s >/dev/null 2>&1; then
        log_info "k3s detected — importing images..."
        for img in cpaas-backend:latest cpaas-go-agent:latest cpaas-frontend:latest; do
            docker save "$img" | sudo k3s ctr images import -
        done
        log_ok "Images loaded into k3s"
    elif command -v minikube >/dev/null 2>&1; then
        log_info "minikube detected — loading images..."
        minikube image load cpaas-backend:latest
        minikube image load cpaas-go-agent:latest
        minikube image load cpaas-frontend:latest
        log_ok "Images loaded into minikube"
    else
        log_warn "Unknown cluster type — make sure images are available in your registry"
        log_warn "Push images: docker push your-registry/cpaas-backend:latest"
    fi
}

##########################################################
# STEP 3: Add Helm Repos
##########################################################
add_helm_repos() {
    log_info "Adding Helm repositories..."

    helm repo add bitnami https://charts.bitnami.com/bitnami 2>/dev/null || true
    helm repo add traefik https://helm.traefik.io/traefik 2>/dev/null || true
    helm repo add metallb https://metallb.github.io/metallb 2>/dev/null || true
    helm repo add livekit https://helm.livekit.io 2>/dev/null || true
    helm repo update

    log_ok "Helm repos ready"
}

##########################################################
# STEP 4: Install/Upgrade Helm Chart
##########################################################
deploy_helm() {
    log_info "Deploying Helm chart (environment: ${ENVIRONMENT})..."

    # Build Helm dependencies
    helm dependency update "${HELM_CHART}"

    EXTRA_VALUES=""
    if [ -f "${VALUES_ENV_FILE}" ]; then
        EXTRA_VALUES="-f ${VALUES_ENV_FILE}"
        log_info "Using environment values: ${VALUES_ENV_FILE}"
    fi

    # Pre-install MetalLB
    log_info "Deploying MetalLB..."
    helm upgrade --install metallb metallb/metallb \
        --namespace metallb-system --create-namespace \
        --wait --timeout 3m
    
    # Wait a bit for webhook to be ready, then apply IPAddressPools
    sleep 10
    kubectl apply -f "${HELM_CHART}/metallb-config.yaml"


    # Deploy
    helm upgrade --install "${HELM_RELEASE}" "${HELM_CHART}" \
        -f "${VALUES_FILE}" \
        ${EXTRA_VALUES} \
        --create-namespace \
        --wait \
        --timeout 10m \
        --atomic \
        "$@"

    log_ok "Helm deployment complete!"
}

##########################################################
# STEP 5: Post-Deploy Verification
##########################################################
verify_deployment() {
    log_info "Verifying deployment..."

    # Check all pods are running
    NAMESPACES=("voip-edge" "voip-core" "ai-engine" "control-plane")
    ALL_OK=true

    for ns in "${NAMESPACES[@]}"; do
        NOT_READY=$(kubectl get pods -n "$ns" --no-headers 2>/dev/null | grep -v "Running\|Completed" | wc -l)
        if [ "$NOT_READY" -gt 0 ]; then
            log_warn "Some pods not ready in namespace: $ns"
            kubectl get pods -n "$ns"
            ALL_OK=false
        else
            log_ok "All pods running in namespace: $ns"
        fi
    done

    if [ "$ALL_OK" = true ]; then
        log_ok "All services are running!"
    fi
}

##########################################################
# STEP 6: End-to-End Test
##########################################################
run_e2e_test() {
    log_info "Running end-to-end platform tests..."

    BACKEND_POD=$(kubectl get pod -n control-plane -l app=backend-api -o jsonpath='{.items[0].metadata.name}')
    GO_AGENT_POD=$(kubectl get pod -n ai-engine -l app=go-agent -o jsonpath='{.items[0].metadata.name}')

    # Test 1: Backend health
    log_info "Test 1: Backend health check..."
    HEALTH=$(kubectl exec -n control-plane "$BACKEND_POD" -- wget -q -O - http://localhost:8080/api/internal/health 2>/dev/null)
    echo "$HEALTH" | grep -q "ok" && log_ok "Backend: HEALTHY" || log_err "Backend: UNHEALTHY"

    # Test 2: Go Agent health
    log_info "Test 2: Go Agent health check..."
    AGENT_HEALTH=$(kubectl exec -n ai-engine "$GO_AGENT_POD" -- wget -q -O - http://localhost:8080/health 2>/dev/null)
    echo "$AGENT_HEALTH" | grep -q "ok" && log_ok "Go Agent: HEALTHY" || log_err "Go Agent: UNHEALTHY"

    # Test 3: Phone config lookup (tests DB + API chain)
    log_info "Test 3: Phone config API..."
    PHONE_TEST=$(kubectl exec -n control-plane "$BACKEND_POD" -- \
        wget -q -O - \
        --header "X-Internal-Key: $(kubectl get secret cpaas-global-secrets -n control-plane -o jsonpath='{.data.internal-api-key}' | base64 -d)" \
        "http://localhost:8080/api/internal/phone-config/+15551234567" 2>/dev/null || echo '{"error":"number_not_configured"}')
    echo "$PHONE_TEST" | grep -q "error\|tenantId" && log_ok "Phone config API: RESPONDING" || log_warn "Phone config API: unexpected response"

    # Test 4: LiveKit connectivity
    log_info "Test 4: LiveKit Server connectivity..."
    LK_POD=$(kubectl get pod -n ai-engine -l app=livekit-server -o jsonpath='{.items[0].metadata.name}')
    LK_HEALTH=$(kubectl exec -n ai-engine "$LK_POD" -- wget -q -O - http://localhost:7880/ 2>/dev/null || echo "error")
    echo "$LK_HEALTH" | grep -qv "error" && log_ok "LiveKit Server: RESPONDING" || log_warn "LiveKit Server: may not be ready yet"

    # Test 5: OpenSIPS management interface
    log_info "Test 5: OpenSIPS MI interface..."
    OPENSIPS_POD=$(kubectl get pod -n voip-edge -l app=opensips -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ -n "$OPENSIPS_POD" ]; then
        OS_HEALTH=$(kubectl exec -n voip-edge "$OPENSIPS_POD" -- wget -q -O - http://localhost:8888/mi/which 2>/dev/null || echo "error")
        echo "$OS_HEALTH" | grep -qv "error" && log_ok "OpenSIPS MI: RESPONDING" || log_warn "OpenSIPS MI: not ready yet"
    fi

    echo ""
    log_ok "============================================"
    log_ok " CPaaS Platform End-to-End Test Complete!"
    log_ok "============================================"
}

##########################################################
# MAIN
##########################################################
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   CPaaS Voice AI Platform Deploy v2.0  ║${NC}"
    echo -e "${BLUE}║   Environment: ${ENVIRONMENT}                     ║${NC}"
    echo -e "${BLUE}║   Action: ${ACTION}                        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""

    check_prerequisites

    case "${ACTION}" in
        install|upgrade)
            build_images
            load_images_to_k8s
            add_helm_repos
            deploy_helm
            verify_deployment
            ;;
        uninstall)
            helm uninstall "${HELM_RELEASE}" || true
            log_ok "Uninstalled"
            ;;
        status)
            verify_deployment
            ;;
        test)
            run_e2e_test
            ;;
        build)
            build_images
            load_images_to_k8s
            ;;
        *)
            log_err "Unknown action: ${ACTION}. Use: install|upgrade|uninstall|status|test|build"
            ;;
    esac
}

main "$@"
