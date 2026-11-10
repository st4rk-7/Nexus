// CI/CD for Nexus: build the images, run the tests, redeploy the stack, check it is up.
pipeline {
    // Runs on the lab agent whose work folder is ~/jenkins-agent.
    agent { label 'lab-agent' }

    environment {
        // Same name as a manual `docker compose up`, so Jenkins updates that stack and its volumes.
        COMPOSE_PROJECT_NAME = 'nexus-devops'
    }

    stages {
        stage('Prepare') {
            steps {
                // backend/.env is not in Git; create one with a random JWT secret on the first build.
                sh '''
                    if [ ! -f backend/.env ]; then
                        cp backend/.env.example backend/.env
                        sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(od -An -N32 -tx1 /dev/urandom | tr -d ' \\n')/" backend/.env
                    fi
                '''
            }
        }

        stage('Build') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Test') {
            steps {
                sh 'docker compose run --rm --no-deps backend bun run test'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Health check') {
            steps {
                retry(10) {
                    sleep 3
                    sh '''docker compose exec -T backend bun -e "const r = await fetch('http://localhost:3001/health'); process.exit(r.ok ? 0 : 1)"'''
                }
            }
        }
    }
}
