const express = require('express');
const cors = require('cors');
let bcrypt = require('bcryptjs');
const knex = require('knex');

const app = express()
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));
const port = 4000;

const db = knex({
    client: 'postgres',
    connection: {
        host: '127.0.0.1',
        user: 'pcabrera',
        password: 'W0nd3rful',
        database: 'smart-brain'
    }
});
// db.select('*').from('users').then(users => console.log(users))


const db1 = {
    users: [
        {
            id: '0',
            name: 'john',
            email: 'john@smith.com',
            password: '12345',
            entries: 0,
            joined: new Date()
        },
        {
            id: '1',
            name: 'sally',
            email: 'sally@gmail.com',
            password: 'sally123',
            entries: 0,
            joined: new Date()
        },
        {
            id: '2',
            name: 'prince',
            email: 'prince@cabrera.com',
            password: '12345',
            entries: 0,
            joined: new Date()
        },
    ],
    // login: [
    //     {
    //         id
    //     }
    // ]
}

app.get('/', (req, res) => {
    console.log('hello world!')
    res.send(db.users)
})

app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    // let found = false;
    db.select('*')
    .from('users')
    .where({id})
    .then(user => {
        if (user.length) {
            res.json(user[0])
        } else {
            res.status(404)
            .json('No Such User')
        }
     
    })

    
})

app.put('/image', (req, res) => {
    const {id} = req.body;
    // let found = false;
    db('users').where({id})
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0])
    })
    .catch(err => res.status(400).json('Unable to get entries'))
})

app.post('/signin', (req, res) => {
    const {password, email} = req.body
    db.select('email', 'hash')
    .from('login')
    .where({email: req.body.email})
    .then(data => {
        if (data.length){
            if (bcrypt.compareSync(password, data[0].hash) && data[0].email === email){
                return db.select('*').from('users').where({email})
                .then(user => {
                    console.log(user)
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('Unable to get user'))
            } else {
                console.log('OOPS! Wrong Credentials... \nTry again!')
            }
        } else {
            res.status(400).json(`OOPS! Wrong Credentials... Try again!`)
        }
    })
})

app.post('/register', (req, res) => {
    const {name, email, password} = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash,
            email
        })
        .into('login')
        .returning('email')
        .then( email => 
            {
                return trx('users')
                .returning('*')
                .insert({
                    name: name,
                    email: email[0],
                    joined: new Date()
                })
                .then(user => res.json(user[0]))
            })
        .then(trx.commit)
        .catch(trx.rollback)
        })
        .catch(err => {
            res.status(400)
            if (JSON.parse(err.code) === 23505 ){
                res.send(`User ${email} already exists!`)
            } else {
                res.send(err)
            }
            
        }) 
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

// ENDPOINTS

/*

/ -> res = this is working
/signin -> POST = success/fail
/register -> POST = user
/profile/:userid -> GET = user
/image -> PUT -> user




*/

/*
const hashed = '$2a$10$8lHi6.4o7OxAVNDxKq1An.MkYLSudBODKxa.QnmdLndvdmTasSO6m';

    let test = bcrypt.compare("principe123", hashed)
    .then(res => { if(res){console.log('Password Matches!')}else{
        console.log('Password Did NOT Match!')
    }})
    // .catch(res.send('Password does not match our records'));



       const salt = bcrypt.genSaltSync(10);

    bcrypt.hash(password, salt, function(err, hash) {
        console.log(`salt: `,salt)
        console.log(`hash: `, hash)
    });
    
*/