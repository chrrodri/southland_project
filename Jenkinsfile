pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    choice(name: 'TF_ACTION', choices: ['apply', 'plan'], description: 'Run terraform plan or apply.')
    string(name: 'AWS_REGION', defaultValue: 'us-east-1', description: 'AWS region for Terraform and AWS CLI.')
    booleanParam(name: 'INVALIDATE_CACHE', defaultValue: true, description: 'Invalidate CloudFront after uploading files.')
  }

  environment {
    TF_IN_AUTOMATION = 'true'
    TF_INPUT = 'false'
    SITE_DIR = '.'
    TF_DIR = 'terraform'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Validate Site Files') {
      steps {
        sh '''
          test -f index.html
          test -f assets/css/styles.css
          test -f assets/js/main.js
        '''
      }
    }

    stage('Terraform Init') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins-credentials']]) {
          sh '''
            cd "$TF_DIR"
            terraform init
            terraform fmt -check
            terraform validate
          '''
        }
      }
    }

    stage('Terraform Plan') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins-credentials']]) {
          sh '''
            cd "$TF_DIR"
            terraform plan \
              -var="aws_region=${AWS_REGION}" \
              -out=tfplan
          '''
        }
      }
    }

    stage('Terraform Apply') {
      when {
        expression { params.TF_ACTION == 'apply' }
      }
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins-credentials']]) {
          sh '''
            cd "$TF_DIR"
            terraform apply -auto-approve tfplan
          '''
        }
      }
    }

    stage('Upload Static Site') {
      when {
        expression { params.TF_ACTION == 'apply' }
      }
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins-credentials']]) {
          sh '''
            BUCKET_NAME="$(cd "$TF_DIR" && terraform output -raw site_bucket_name)"

            aws s3 sync "$SITE_DIR" "s3://${BUCKET_NAME}/" \
              --region "$AWS_REGION" \
              --delete \
              --exclude ".git/*" \
              --exclude ".terraform/*" \
              --exclude "terraform/*" \
              --exclude "Jenkinsfile" \
              --exclude "*.zip"

            aws s3 cp index.html "s3://${BUCKET_NAME}/index.html" \
              --region "$AWS_REGION" \
              --cache-control "no-cache, no-store, must-revalidate" \
              --content-type "text/html"

            aws s3 sync assets "s3://${BUCKET_NAME}/assets/" \
              --region "$AWS_REGION" \
              --cache-control "public, max-age=31536000, immutable"
          '''
        }
      }
    }

    stage('Invalidate CloudFront') {
      when {
        allOf {
          expression { params.TF_ACTION == 'apply' }
          expression { params.INVALIDATE_CACHE }
        }
      }
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-jenkins-credentials']]) {
          sh '''
            DISTRIBUTION_ID="$(cd "$TF_DIR" && terraform output -raw cloudfront_distribution_id)"
            aws cloudfront create-invalidation \
              --distribution-id "$DISTRIBUTION_ID" \
              --paths "/*"
          '''
        }
      }
    }
  }

  post {
    success {
      sh '''
        if [ "${TF_ACTION}" = "apply" ]; then
          cd "$TF_DIR"
          echo "Site URL: $(terraform output -raw site_url)"
        fi
      '''
    }
  }
}
