<h2 align="center">API WEB SCRAPING</h2>



## Sobre

Essa API faz web scraping dos sites: **ZOOM**,  **Magazine**,  **Americanas** e **Amazon**
Ela mantém um controle de 5 dias(dá pra atualizar na função **compareDate**) dias em cada produto: Se o produto foi feito web scraping em menos de 5 dias, o retorno da API vai ser o produto que já tem no banco de dados.

## Executar
> yarn
> yarn start

em desenvolvimento
> yarn
>yarn dev


## :seedling: Requisitos Mínimos

Nodejs  >= 10.19.0 (não testado com inferior)
Yarn
Mongodb

Obs.: CloudMongo(site/Bd online) permite até 512mb de graça(foi utilizado no desenvolvimento, 140 produtos ocuparam 1.2mb)

## .env

O .env deve ter essas váriaveis para funcionar.

>MONGO_URL =  'url-do-seu-Bd'

>PORT =  3001(Exemplo)


## :rocket: Tecnologias Utilizadas 

O projeto foi desenvolvido utilizando as seguintes tecnologias

- Nodejs
- Puppeter
- Axios
- Cheerio
- Mongoose

## :link: Como acrescentar lojas 

- Crie o algoritmo de scraping e coloque na pasta **Utils**
- Crie um controller da nova loja adicionada na pasta **controllers**
- Lembre-se de se basear no outros controllers e usar o **compareDate** para fazer o controle da atualização de produtos em banco.
- Adicione o controller no **index.js** na pasta **src**

Obs.: Todas as rotas da API são mostradas no terminal quando ela é iniciada.
