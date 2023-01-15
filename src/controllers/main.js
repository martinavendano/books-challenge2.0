const bcryptjs = require('bcryptjs');

const session = require('express-session');
const { Op } = require("sequelize");

const db = require('../database/models');

const mainController = {
  home: (req, res) => {
    db.Book.findAll({
      include: [{ association: 'authors' }]
    })
      .then((books) => {
        res.render('home', { books });
      })
      .catch((error) => console.log(error));
  },
  bookDetail: async (req, res) => {
    // Implement look for details in the database
let category=req.cookies.user
let id=req.params.id
let datos=await db.Book.findAll({ where: id={id},include: [{ association: 'authors' }] });
      
res.render("bookDetail",{data:datos,category})
    
   
  },
  bookSearch: (req, res) => {
    res.render('search', { books: [] });
  },
  bookSearchResult: (req, res) => {
    // Implement search by title
    db.Book.findAll({
      where: {
        title: {
          [Op.substring]: req.body.title
        }
      },
      include: ['authors']
    })
      .then((books) => {
        return res.render('search', {
          books,
          keywords: req.body.title
        });
      })
      .catch((error) => console.long(error))
  },
  deleteBook: async (req, res) => {
    const dele = await db.Book.destroy({ where: { id: req.params.id } });
    res.redirect("/")
    
  },
  authors: (req, res) => {
    db.Author.findAll()
      .then((authors) => {
        res.render('authors', { authors });
      })
      .catch((error) => console.log(error));
  },
  authorBooks: (req, res) => {
    // Implement books by author
    const { id } = req.params;
    db.Author.findByPk(id, {
      include: ['books']
    })
      .then((author) => {
        res.render('authorBooks', { author });
      })
      .catch((error) => console.log(error));
  },
  register: (req, res) => {
    res.render('register');
  },
  processRegister: (req, res) => {
    db.User.create({
      Name: req.body.name,
      Email: req.body.email,
      Country: req.body.country,
      Pass: bcryptjs.hashSync(req.body.password, 10),
      CategoryId: req.body.category
    })
      .then(() => {
        res.redirect('/');
      })
      .catch((error) => console.log(error));
  },
  login: (req, res) => {
    res.render('login');
  },
  logout: (req, res) => {

    req.session.destroy();
    res.clearCookie("user")
    res.redirect("/")

  },

  processLogin: async (req, res) => {
    let { email, password } = req.body;

    let ComprobandoUsuarios = await db.User.findOne(({ where: { Email: email } }))
    if (ComprobandoUsuarios === null) {

      res.render("register")

    } else {
      let category = ComprobandoUsuarios.CategoryId
      let comprobandoPass = await bcryptjs.compare(password, ComprobandoUsuarios.Pass)
      if (comprobandoPass === true) {
        
        res.cookie("user", category, "kgueado");
        let books = await db.Book.findAll({
          include: [{ association: 'authors' }]
        })
        res.redirect("/")
      } else {
        res.render("register")
      }
    }
  },
  edit: async (req, res) => {
    let id = req.params.id
    let info = await db.Book.findAll({ where: id = { id } })
    const dato = {
      title: info[0].dataValues.title,
      cover: info[0].dataValues.cover,
      description: info[0].dataValues.description,
      id: info[0].dataValues.id,
    }
    res.render('editBook', { id: id, data: dato })
  },
  processEdit: async (req, res) => {
    let id = req.params.id

    console.log(id);
    let { title, cover, description } = req.body

    let modificar = await db.Book.update({
      title: title,
      cover: cover,
      description: description
    }, {
      where: { id: id }
    })
    let books = await db.Book.findAll({
      include: [{ association: 'authors' }]
    })
    res.render('home', { books });
  }};




module.exports = mainController;
