#!/bin/bash
# Normalmente las variables de ambiente se ponen en el proyecto de pipeline de terraform.
# El proyecto de pipeline es el primero que se instala, despues se instalan otros proyectos como terraform stateful y terraform level 1.
# El problema es que cuando instalamos el proyecto de pipeline, estas variables de ambiente que vienen en este archivo, todavia no existen.
# Entonces estas variables de ambiente las ponemos en este archivo que se ejecuta cuando ya existe toda la infraestructura.
set -e

echo 'download terraform state'
cd "$CODEBUILD_SRC_DIR"
aws s3 cp s3://$TF_BUCKET/env:/$WORKSPACE_NAME/rutabus/terraform.tfstate terraform-rutabus.json

echo 'Put environment variables from terraform state'
S3_BUCKET_RUTABUS=$(jq -r '.outputs."s3-react-rutabus".value.bucket' terraform-rutabus.json)
cognito_userpool_id=$(jq -r '.outputs."cognito_rutabus".value.id' terraform-rutabus.json)
export NEXT_PUBLIC_COGNITO_USER_POOL_ID=$cognito_userpool_id
cognito_userpool_webclient_id=$(jq -r '.outputs."cognito_rutabus_web_client".value.id' terraform-rutabus.json)
export NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID=$cognito_userpool_webclient_id
public_api_id=$(jq -r '.outputs."api_gateway_rutabus".value.id' terraform-rutabus.json)
export NEXT_PUBLIC_API_ID=$public_api_id
public_api_url=$(jq -r '.outputs."api_gateway_rutabus_domain_name".value."domain_name"' terraform-rutabus.json)
export NEXT_PUBLIC_API_URL=https://$public_api_url

echo 'Building next application'
npm run static

echo 'Deploy to AWS Account'
role_arn=$ASSUME_ROLE
session_name="ReactRutabus"

sts=( $(
    aws sts assume-role \
    --role-arn "$role_arn" \
    --role-session-name "$session_name" \
    --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]' \
    --output text
) )
export AWS_ACCESS_KEY_ID=${sts[0]}
export AWS_SECRET_ACCESS_KEY=${sts[1]}
export AWS_SESSION_TOKEN=${sts[2]}

echo 'Empty bucket'
aws s3 rm s3://$S3_BUCKET_RUTABUS --recursive

echo 'Copy build to bucket'
aws s3 cp out s3://$S3_BUCKET_RUTABUS --recursive
