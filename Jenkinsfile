pipeline {

    agent {
        label 'debian10'
    }

    stages {
        stage('Building') {
            steps {
                script {
                    sh "npm install"
                    sh "npm run build"
                }
            }
        }

    }

}
