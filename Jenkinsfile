pipeline {
    agent any

    options {
        timestamps()
        skipStagesAfterUnstable()
        disableConcurrentBuilds()
    }

    environment {
        AWS_IMAGE             = 'amazon/aws-cli:2.31.0'
        NODE_IMAGE            = 'chrrodri/node-deps:latest'

        APP_NAME              = 'southland-modern-site'
        APP_VERSION           = "1.0.${env.BUILD_NUMBER}"

        AWS_DEFAULT_REGION    = 'us-east-1'
        AWS_S3_BUCKET         = "chrrodri-${APP_NAME}"

        // Cambia estos valores por los de la distribucion real del proyecto.
        AWS_DIST_ID           = 'E1JZC2YWX8GM0Z'
        AWS_CLOUDFRONT_URL    = 'Rd2ps7ygwur8sb0.cloudfront.net'
    }

    stages {
        stage('VALIDATE') {
            stages {
                stage('Validate static files') {
                    agent {
                        docker {
                            image "${NODE_IMAGE}"
                            reuseNode true
                        }
                    }
                    steps {
                        sh '''
                            set -e

                            test -f index.html
                            test -f assets/css/styles.css
                            test -f assets/js/main.js
                            test -d assets/img

                            node --check assets/js/main.js

                            echo "Static site files validated for ${APP_NAME} ${APP_VERSION}"
                        '''
                    }
                }
            }
        }

        stage('DEPLOY') {
            stages {
                stage('Deploy to S3 and CloudFront') {
                    agent {
                        docker {
                            image "${AWS_IMAGE}"
                            args '--entrypoint=""'
                            reuseNode true
                        }
                    }
                    steps {
                        withCredentials([
                            string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
                            string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
                        ]) {
                            sh '''
                                set -e

                                export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION}"

                                echo "Publishing ${APP_NAME} ${APP_VERSION} to s3://${AWS_S3_BUCKET}"

                                aws s3 sync assets "s3://${AWS_S3_BUCKET}/assets/" \
                                    --delete \
                                    --cache-control "public, max-age=31536000, immutable"

                                aws s3 cp index.html "s3://${AWS_S3_BUCKET}/index.html" \
                                    --cache-control "no-cache, no-store, must-revalidate" \
                                    --content-type "text/html"

                                aws cloudfront create-invalidation \
                                    --distribution-id "${AWS_DIST_ID}" \
                                    --paths "/*"

                                echo "CloudFront URL: https://${AWS_CLOUDFRONT_URL}"
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Deploy completed: https://${AWS_CLOUDFRONT_URL}"
        }
        always {
            cleanWs()
        }
    }
}
