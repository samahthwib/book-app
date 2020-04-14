DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    authors VARCHAR (255),
    title  VARCHAR (255),
    isbn   VARCHAR (255),
    image VARCHAR (255),
    description text,
    bookshelf VARCHAR (255)
);



INSERT INTO books (authors, title, isbn, image, description, bookshelf)
VALUES ('samah' , 'food' , 'Not Found' , 'Not Found' , 'nothing' , 'nothing');

INSERT INTO books (authors, title, isbn, image, description, bookshelf)
VALUES ('saja' , 'birds' , 'Not Found' , 'Not Found' , 'nothing' , 'nothing');