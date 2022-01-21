<p align="center">
  <img src="https://storage.googleapis.com/bookshlf-in/static/logo/logoView.png" width="350" />
  <h1 align="center">Bookshlf Backend</h1>
</p>

Bookshlf is an online second-hand book store. Have a look on it [here](https://bookshlf.in).

This Respository contains backend APIs of [Bookshlf](https://github.com/Bookshlf-in/Website).

## Built With

- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)

## Contributing

Love the project and want to get involved? You’re in the right place!

## Requirements

You will need `node` and `npm` installed globally on your machine.

- Download and Install [Node.js](https://nodejs.org/en/download/)

- Open terminal, write the following command and press enter.

```bash
  $ npm -v
```

The terminal should return your npm version.

## How to set up your local environment

#### 1. Clone App

- Make a new folder and open the terminal there.
- Write the following command and press enter.

```bash
  $ git clone https://github.com/Bookshlf-in/Backend.git
```

#### 2. Install node packages

- Move inside the cloned folder.
- Write the following command and press enter to download all required node modules.

```bash
  $ npm install
```

#### 3. To run locally, you are required to setup some environment variables

- Create a `.env` file in root directory of project
- Define environment variables in it as described below

```
DATABASE=<Database connection URL>
JWT_SECRET=<Put any string here as your JWT Secret>
CORS_ORIGIN=["http://localhost:3000"]
SENDGRID_API_KEY=<API KEY of sendgrid>
ADMIN_EMAIL=<Your email address>
GCLOUD_BUCKET=<Google Cloud bucket name>
GCLOUD_JSON_KEY=<Google account key to access bucket (in json format)>
```

#### 4. Run Locally

- While you are still inside the cloned folder, write the following command to run the website locally.

```bash
  $ npm start
```

#### You can now access backend APIs at [localhost:4000](http://localhost:4000)

## How to Contribute

To start contributing, follow the below guidelines:

**1.** Fork this repository.

**2.** Follow the Environment setup above.

**3.** Checkout into the dev branch. Create a branch from the dev branch with `git checkout -b branchname` where the name is something descriptive about the issue your branch will fix.

```bash
  $ git checkout -b <branch_name>
```

**4.** Make your changes, and test them to make sure they work.

**5.** Add and commit your changes

```bash
  $ git add . && git commit -m "<your_message>"
```

**6.** Push Code to Github under your branch

```bash
  $ git push origin <your_branch_name>
```

**7.** When you're ready to submit your pull request, merge the latest version of dev, to make sure your branch is up to date:

```bash
  git checkout dev
  git pull origin dev
  git checkout <your_branch_name>
  git merge dev
```

**8.** Resolve any merge conflicts if they exist, test to make sure your feature branch still works correctly, and then `git push origin <your_branch_name>`

**9.** On Github, create a pull request from your feature branch. Always make the PR against the dev branch! Make sure to summarize your changes you made, and if there's anything specific you want reviewed or tested, note that in the PR.

**10.** When approved, your branch will be merged into master and you're done! Thanks for contributing! :)

## Author

**Rohit Kumar**

- [github/RohitKumar-200](https://github.com/RohitKumar-200)

## Copyright and License

Copyright (c) 2022, Bookshlf.

Bookshlf source code is licensed under the [MIT License](https://github.com/Bookshlf-in/Backend/blob/main/LICENSE).
