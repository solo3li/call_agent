{{/*
CPaaS Helm Chart Helpers v2.0
*/}}

{{/* Chart name */}}
{{- define "cpaas.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Full name */}}
{{- define "cpaas.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/* Chart label */}}
{{- define "cpaas.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Common labels */}}
{{- define "cpaas.labels" -}}
helm.sh/chart: {{ include "cpaas.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}

{{/* Selector labels */}}
{{- define "cpaas.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cpaas.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* Image reference helper */}}
{{- define "cpaas.image" -}}
{{- $registry := .Values.global.imageRegistry -}}
{{- $repo := .repo -}}
{{- $tag := .tag -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry $repo $tag -}}
{{- else -}}
{{- printf "%s:%s" $repo $tag -}}
{{- end -}}
{{- end }}

{{/* Internal API Key Secret ref */}}
{{- define "cpaas.internalKeyEnv" -}}
- name: INTERNAL_API_KEY
  valueFrom:
    secretKeyRef:
      name: cpaas-global-secrets
      key: internal-api-key
{{- end }}

{{/* PostgreSQL connection string */}}
{{- define "cpaas.postgresConnStr" -}}
{{- printf "Host=postgresql.%s.svc.cluster.local;Port=5432;Database=%s;Username=%s;Password=%s" .Release.Namespace .Values.postgresql.auth.database .Values.postgresql.auth.username .Values.postgresql.auth.password -}}
{{- end }}

{{/* LiveKit env vars */}}
{{- define "cpaas.livekitEnvVars" -}}
- name: LIVEKIT_URL
  value: "ws://livekit-server.{{ .Values.global.namespaces.aiEngine }}.svc.cluster.local:7880"
- name: LIVEKIT_API_KEY
  valueFrom:
    secretKeyRef:
      name: cpaas-livekit-secrets
      key: api-key
- name: LIVEKIT_API_SECRET
  valueFrom:
    secretKeyRef:
      name: cpaas-livekit-secrets
      key: api-secret
{{- end }}

{{/* Backend API URL */}}
{{- define "cpaas.backendURL" -}}
{{- printf "http://backend-api.%s.svc.cluster.local:8080" .Values.global.namespaces.controlPlane -}}
{{- end }}
