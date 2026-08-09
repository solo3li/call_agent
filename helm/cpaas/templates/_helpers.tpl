# _helpers.tpl — Helm template helpers

{{/*
Expand the name of the chart.
*/}}
{{- define "cpaas.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Full release name
*/}}
{{- define "cpaas.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cpaas.labels" -}}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
PostgreSQL connection string
*/}}
{{- define "cpaas.postgresConn" -}}
Host=cpaas-postgres;Port=5432;Database={{ .Values.postgres.database }};Username={{ .Values.postgres.username }};Password={{ .Values.postgres.password }}
{{- end }}

{{/*
nip.io domain for a given subdomain
*/}}
{{- define "cpaas.domain" -}}
{{- printf "%s.%s" . $.Values.global.domain }}
{{- end }}
