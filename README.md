# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

| File or Folder | Purpose                              |
| -------------- | ------------------------------------ |
| `app/`         | content for UI frontends goes here   |
| `db/`          | your domain models and data go here  |
| `srv/`         | your service models and code go here |
| `package.json` | project metadata and configuration   |
| `readme.md`    | this getting started guide           |

## Setup

```
cf create-service-key mtxs-reviews-db mtxs-reviews-db-key

cds bind -2 mtxs-reviews-db
```

Copy the entry created by the previous command from the `.cdsrc-private.json` file as the following command will replace it:

```
cds bind -2 mtxs-bookshop-db
```

Edit `.cdsrc-private.json` and paste the backup. Replace "name": "db" with "name": "mtxs-bookshop-db" for the "instance": "mtxs-bookshop-db".
