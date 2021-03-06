const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/config').get(process.env.NODE_ENV);
const app = express();
const path = require('path');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://engleman:11july2017@ds119650.mlab.com:19650/pinterest-7512');

const {User} = require('./models/user');
const {Product} = require('./models/product');
const {auth} = require('./middleware/auth');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build')));

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// GET //
app.get('/api/getProduct', (req, res) => {
	let id = req.query.id;
	Product.findById(id, (err, doc) => {
		if (err) {
			return res.status(400).send(err);
		} else {
			res.send(doc);
		}
	})
});

app.get('/api/GetAllProducts', (req, res) => {
	Product.find().exec((err, doc) => {
		if (err) {
			return res.status(400).send(err);
		} else {
			res.send(doc);
		}
	})
});


app.get('/api/user_boards', (req, res) => {
	User.find({email: req.query.user}).exec((err, docs) => {
		if (err) {
			return res.status(400).send(err);
		} else {
			res.send(docs[0].boards);
		}
	})
});

app.get('/api/product_comments', (req, res) => {
	Product.find({_id: req.query.product}).exec((err, docs) => {
		if (err) {
			return res.status(400).send(err);
		} else {
			res.send(docs[0].comments);
		}
	})
});

app.get('/api/logout', auth, (req, res) => {
	res.send(req.user);
	req.user.deleteToken(req.token, (err, user) => {
		if (err) {
			return res.status(400).send(err);
		} else {
			res.status(200);
		}
	})
});


// POST //
app.post('/api/register', (req, res) => {
	const user = new User(req.body);

	user.save((err, doc) => {
		if (err) {
			return res.json({error: err});
		} else {
			user.generateToken((err, user) => {
				if (err) {
					return res.status(400).send(err);
				} else {
					res.cookie('auth', user.token).json({
						success: true,
						id: doc._id,
						name: doc.firstName,
						email: doc.email
					});
				}
			});
		}
	})
});

app.post('/api/login', (req, res) => {
	User.findOne({'email': req.body.email}, (err, user) => {
		if (!user) {
			return res.json({isAuth: false, message: 'Auth failed, email not found'});
		} else {
			user.comparePassword(req.body.password, (err, isMatch) => {
				if (!isMatch) {
					return res.json({
						isAuth: false,
						message: 'Wrong password'
					});
				}
				user.generateToken((err, user) => {
					if (err) {
						return res.status(400).send(err);
					} else {
						res.cookie('auth', user.token).json({
							isAuth: true,
							boards: user.boards,
							id: user._id,
							name: user.firstName,
							email: user.email
						});
					}
				});
			});
		}
	});
});

app.post('/api/loggedInUserReturning', (req, res) => {
	User.findByToken(req.body.token, (err, isMatch) => {
		if (err) {
			return res.status(400).send(err);
		}
		if (!isMatch) {
			return res.json({
				isAuth: false,
				message: 'Token not found'
			});
		} else {
			return res.json({
				isAuth: true,
				boards: user.boards,
				id: user._id,
				name: user.firstName,
				email: user.email
			});
		}
	});
});

// app.post('/api/product', (req, res) => {
// 	const product = new Product(req.body);
//
// 	product.save((err, doc) => {
// 		if(err) {
// 			return res.status(400).send(err);
// 		} else {
// 			res.status(200).json({
// 				post: true,
// 				productId: doc._id
// 			})
// 		}
// 	});
// });



// UPDATE //
//update user boards
app.post('/api/board_update', (req, res) => {
	User.findOneAndUpdate({ email: req.body.email }, { boards: req.body.boards }, {new: true, upsert: true}, (err, doc) => {
		if (err) {
			return res.status(400).send(err);
		} else {
			res.json({
				succcess: true,
				doc
			})
		}
	})
});


//update product comments
app.post('/api/product_update', (req, res) => {
	Product.findOneAndUpdate({ productKey: req.body.productKey }, { comments: req.body.comments }, {new: true, upsert: true}, (err, doc) => {
		if (err) {
			return res.status(400).send(err);
		} else {
			res.json({
				succcess: true,
				doc
			})
		}
	})
});


app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname + '../client/build/index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
	console.log('SERVER RUNNING');
});
