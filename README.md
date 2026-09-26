# MVP2 Healthcare — Interface Web

Interface web para gerenciamento de pacientes e consultas, desenvolvida como parte do projeto de Engenharia de Software.

A aplicação permite cadastrar, consultar, editar e excluir pacientes, além de cadastrar e excluir consultas associadas aos pacientes. A interface também utiliza uma API externa para consulta de endereços por CEP.

O frontend se comunica com um **BFF (Backend for Frontend) utilizando GraphQL**, que por sua vez integra os serviços responsáveis pelo gerenciamento de pacientes e consultas.

---

## 📋 Funcionalidades do sistema

A aplicação disponibiliza:

* Cadastro de pacientes;
* Listagem de pacientes;
* Busca de pacientes;
* Visualização dos dados de um paciente;
* Edição de pacientes;
* Exclusão de pacientes;
* Cadastro de consultas;
* Listagem de consultas de um paciente;
* Exclusão de consultas;
* Consulta de endereço através do CEP;
* Preenchimento automático dos dados de endereço;
* Interface responsiva;
* Integração com GraphQL através do BFF;
* Execução completa da aplicação utilizando Docker Compose.

---

# 🏗️ Arquitetura do sistema

Este serviço faz parte de uma arquitetura composta por:

* [**Frontend** — interface web (docker-composer)](https://github.com/maloisio/mvp2-healthcare-frontend)
* [**BFF (Backend for Frontend)** — API GraphQL que centraliza as requisições do frontend](https://github.com/maloisio/mvp2-bff)
* [**Patient Backend** — gerenciamento de pacientes](https://github.com/maloisio/mvp2-patient-backend)
* [**Scheduling Backend** — gerenciamento de consultas](https://github.com/maloisio/mvp2-scheduling-backend)



<img width="653" height="695" alt="Image" src="https://github.com/user-attachments/assets/c8e12a68-10b6-4113-8dce-47e634f34e30" />



O frontend acessa o BFF através de:

```text
http://localhost:5002/graphql
```

O BFF realiza as chamadas internas para os backends utilizando a rede Docker.

# ️ 🚀 Como executar

## 🐳 Execução com Docker Compose

## Requisitos

Para executar o projeto é necessário ter instalado:

* Docker Desktop;
* Git.

Não é necessário instalar Python, Flask, Ariadne ou Nginx na máquina do usuário quando a aplicação for executada através do Docker Compose.

O Docker será responsável por criar os ambientes necessários para cada serviço.

---

## 📁 Estrutura dos repositórios

O projeto utiliza quatro repositórios separados.

Eles devem ser clonados dentro de uma mesma pasta, mantendo os diretórios no mesmo nível.

O nome da pasta raiz é livre.

Exemplo:

```text
meu-projeto/
│
├── mvp2-healthcare-frontend/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── index.html
│   ├── index.css
│   ├── index.js
│   └── ...
│
├── mvp2-patient-backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ...
│
├── mvp2-scheduling-backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── ...
│
└── mvp2-bff/
    ├── Dockerfile
    ├── requirements.txt
    └── ...
```

É importante que os quatro diretórios estejam no mesmo nível, pois o `docker-compose.yml` utiliza caminhos relativos para localizar os demais projetos.

---

## 📥 Clonando os projetos

Clone os quatro repositórios para a mesma pasta:

```bash
git clone https://github.com/maloisio/mvp2-healthcare-frontend.git
git clone https://github.com/maloisio/mvp2-patient-backend.git
git clone https://github.com/maloisio/mvp2-scheduling-backend.git
git clone https://github.com/maloisio/mvp2-bff.git
```

Depois entre no diretório do frontend:

```bash
cd mvp2-healthcare-frontend
```

---

## ▶️ Executando a aplicação

Dentro da pasta `mvp2-healthcare-frontend`, execute o comando abaixo:

```bash
docker compose up --build
```

Pode ser que seja necessário antes ativar seu ambiente virtual:

**Ativar o ambiente virtual:**

Linux / Mac:
```bash
source env/bin/activate
```

Windows (CMD):
```bash
env\Scripts\activate.bat
```

Windows (PowerShell):
```bash
env\Scripts\Activate.ps1
```

Windows (Git Bash):
```bash
source env/Scripts/activate
```

Quando ativado, o terminal deve exibir `(env)` no início da linha.

O parâmetro `--build` garante que as imagens sejam construídas utilizando os Dockerfiles dos projetos.

## Após a inicialização, os quatro serviços estarão disponíveis:



### Frontend

```text
http://localhost:5500
```

### BFF / GraphQL

```text
http://localhost:5002
```

### GraphiQL

```text
http://localhost:5002/graphql
```

### Patient Backend

```text
http://localhost:5000
```

### Scheduling Backend

```text
http://localhost:5001
```

---

## 🔄 Executando em segundo plano

Para iniciar os serviços sem manter o terminal ocupado:

```bash
docker compose up --build -d
```

Para verificar os containers:

```bash
docker compose ps
```

Para visualizar os logs:

```bash
docker compose logs
```

Para acompanhar os logs de um serviço específico:

```bash
docker compose logs -f bff
```

---

## 🛑 Parando a aplicação

Para parar os containers:

```bash
docker compose down
```

Esse comando remove os containers criados pelo Compose, mas mantém as imagens Docker.

Para reconstruir as imagens posteriormente:

```bash
docker compose up --build
```

---

# 🐳 Serviços Docker

O `docker-compose.yml` configura quatro serviços.

## Frontend

Utiliza o Dockerfile do próprio repositório.

A aplicação é servida utilizando Nginx.

```text
Porta do container: 80
Porta do host: 5500
```

Acesso:

```text
http://localhost:5500
```

---

## Patient Backend

Responsável pelas operações relacionadas aos pacientes.

```text
Porta do container: 5000
Porta do host: 5000
```

---

## Scheduling Backend

Responsável pelas operações relacionadas às consultas.

```text
Porta do container: 5000
Porta do host: 5001
```

A porta externa é `5001` porque o Patient Backend já utiliza a porta `5000` no host.

Dentro da rede Docker, o serviço continua sendo acessado através da porta `5000`.

---

## BFF

Responsável por disponibilizar a API GraphQL utilizada pelo frontend e integrar os serviços de pacientes e consultas.

```text
Porta do container: 5002
Porta do host: 5002
```


---

# 📂 Estrutura do Frontend

A estrutura principal do frontend é organizada da seguinte maneira:

```text
mvp2-healthcare-frontend/
│
├── Dockerfile
├── docker-compose.yml
├── index.html
├── index.css
├── index.js
├── .dockerignore
└── README.md
```

---

# 📄 Descrição dos arquivos

## `index.html`

Arquivo principal da interface web.

Responsável pela estrutura da aplicação e pelos elementos apresentados ao usuário.

Contém, entre outros elementos:

* Cabeçalho da aplicação;
* Área de gerenciamento de pacientes;
* Formulários;
* Campos de dados pessoais;
* Campos de endereço;
* Modal de edição;
* Área de consultas;
* Botões de ações;
* Elementos utilizados pelo JavaScript para atualização dinâmica da interface.

O HTML fornece a estrutura que é manipulada posteriormente pelo JavaScript.

---

## `index.css`

Arquivo responsável pela apresentação visual da aplicação.

Define:

* Layout da interface;
* Cores;
* Tipografia;
* Espaçamentos;
* Botões;
* Formulários;
* Tabelas/listagens;
* Modais;
* Elementos responsivos;
* Estados visuais da interface.

A separação do CSS permite manter a apresentação independente da lógica da aplicação.

---

## `index.js`

Arquivo responsável pela lógica da interface.

Realiza a comunicação entre o frontend e o BFF através da API GraphQL.

Entre suas responsabilidades estão:

* Buscar pacientes;
* Buscar um paciente específico;
* Cadastrar pacientes;
* Atualizar pacientes;
* Excluir pacientes;
* Cadastrar consultas;
* Buscar consultas;
* Excluir consultas;
* Atualizar a interface após as operações;
* Abrir e fechar modais;
* Preencher o formulário de edição;
* Realizar busca de endereço através do CEP;
* Tratar respostas e erros das requisições;
* Atualizar informações apresentadas na tela.

A comunicação principal é realizada através de:

```text
http://localhost:5002/graphql
```

---

## `Dockerfile`

Define como a imagem Docker do frontend é construída.

O frontend utiliza Nginx para disponibilizar os arquivos HTML, CSS e JavaScript.

O fluxo é:

```text
Dockerfile
    ↓
Imagem nginx:alpine
    ↓
Arquivos do frontend
    ↓
Nginx
    ↓
Porta 80 do container
    ↓
Porta 5500 do computador
```

---

## `docker-compose.yml`

Responsável por orquestrar os quatro serviços da aplicação:

* Frontend;
* Patient Backend;
* Scheduling Backend;
* BFF.

Também define:

* Imagens;
* Contextos de build;
* Portas;
* Variáveis de ambiente;
* Dependências entre serviços;
* Comunicação entre containers.

Dessa forma, toda a aplicação pode ser iniciada através de um único comando.

---

## `.dockerignore`

Define arquivos e diretórios que não precisam ser enviados para o contexto de construção da imagem Docker.

Isso evita incluir arquivos desnecessários na imagem.

---

## `README.md`

Documento de apresentação e utilização do projeto.

Contém:

* Descrição da aplicação;
* Funcionalidades;
* Arquitetura;
* Requisitos;
* Estrutura dos projetos;
* Instruções para execução;
* Informações sobre Docker;
* Descrição dos arquivos do frontend;
* Endpoints dos serviços.

---

# 🔌 Comunicação entre os serviços

A comunicação ocorre em duas camadas.

### Navegador → BFF

O navegador acessa:

```text
http://localhost:5002/graphql
```

As operações são realizadas utilizando GraphQL.

### BFF → Backends

Dentro da rede Docker:

```text
BFF
 │
 ├──→ http://patient-backend:5000
 │
 └──→ http://scheduling-backend:5000
```

Os nomes dos serviços são resolvidos automaticamente pelo Docker através da rede interna criada pelo Compose.

---

# 🌐 API externa

A aplicação utiliza a **API ViaCEP** para consulta de endereços através do CEP.

O usuário informa o CEP na interface e o sistema consulta os dados do endereço, como:

* Logradouro;
* Complemento;
* Bairro;
* Localidade;
* UF.

Os dados retornados pela API são tratados pela aplicação e utilizados para preencher os campos de endereço do paciente.

A consulta é realizada pela aplicação, não sendo necessário redirecionar o usuário para o site externo.

---

# 🧪 Verificação da aplicação

Após executar:

```bash
docker compose up --build
```

acesse:

```text
http://localhost:5500
```

Para verificar os containers:

```bash
docker compose ps
```

Os quatro serviços devem estar em execução:

```text
frontend
patient-backend
scheduling-backend
bff
```

Também é possível acessar a interface GraphiQL:

```text
http://localhost:5002/graphql
```

---

# 🔧 Tecnologias utilizadas

## Frontend

* HTML5
* CSS3
* JavaScript

## BFF

* Python
* Flask
* Ariadne
* GraphQL

## Backends

* Python
* Flask
* OpenAPI

## Infraestrutura

* Docker
* Docker Compose
* Nginx

## API externa

* ViaCEP

---

# 👥 Organização do projeto

O projeto é dividido em serviços independentes, cada um mantido em seu próprio repositório.

```text
Frontend
   │
   ▼
BFF / GraphQL
   │
   ├───────────────┐
   ▼               ▼
Patient API    Scheduling API
```

Essa divisão permite que cada componente possua responsabilidades específicas e possa ser executado e desenvolvido de maneira independente.

---

# 🚀 Comando rápido

Depois de clonar os quatro repositórios e colocá-los no mesmo diretório:

```bash
cd mvp2-healthcare-frontend
docker compose up --build
```

Depois abra:

```text
http://localhost:5500
```

Para encerrar:

```bash
docker compose down
```
