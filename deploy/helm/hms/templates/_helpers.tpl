{{- define "hms.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "hms.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" (include "hms.name" .) .Values.global.environment | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "hms.namespace" -}}
{{- default .Release.Namespace .Values.namespaceOverride -}}
{{- end -}}

{{- define "hms.labels" -}}
app.kubernetes.io/name: {{ include "hms.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: sims-hospital
app.kubernetes.io/environment: {{ .Values.global.environment | quote }}
{{- end -}}

{{- define "hms.selectorLabels" -}}
app.kubernetes.io/name: {{ include "hms.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "hms.frontendName" -}}
{{- printf "%s-frontend" (include "hms.fullname" .) -}}
{{- end -}}

{{- define "hms.backendName" -}}
{{- printf "%s-backend" (include "hms.fullname" .) -}}
{{- end -}}
