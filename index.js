const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser')


const app = express()
const port = process.env.PORT || 5001;

app.use(bodyParser.urlencoded({extended: true}))
app.use(session({
    name: 'sid',
    resave: false,
    secret: 'assassin',
    cookie: {
        maxAge: 86400000,
        sameSite: true,
        secure: false,
    }
}))

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login')
    }
    else {
        next();
    }
}

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/dashboard')
    }
    else {
        next();
    }
}

let users = [
    { id: 1, name: 'Alex', email: 'alex@gmail.com', password: 'secret' },
    { id: 2, name: 'Mike', email: 'mike@gmail.com', password: 'secret' },
    { id: 3, name: 'John', email: 'john@gmail.com', password: 'secret' },
    { id: 4, name: 'James', email: 'james@gmail.com', password: 'secret' },
    { id: 5, name: 'Tom', email: 'tom@gmail.com', password: 'secret' },
    { id: 6, name: 'Mark', email: 'mark@gmail.com', password: 'secret' },
    { id: 7, name: 'test', email: 'test@test.com', password: 'test' }
]

app.get('/', (req, res) => {
    console.log(req.session)
    const { userId } = req.session;
    res.send(
        `
        <div style="display:flex; align-items:center; justify-content: center; flex-direction: column; height: 100vh;">
            <h1>Welcome</h1>
            ${userId ? `<a href='/'>Home</a>
            <a href="/dashboard">dashboard</a>
            <form method='post' action='/logout'>
                <button style="background-color: #f44336;border: none;color: white;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 100%">Logout</button>
            </form>` : `<a href='/login'>Login</a>
            <a href='/register'>Register</a>` }
            </div>
        `
    )
})

app.get('/login', redirectHome, (req, res, next) => {
    res.send(`
    <div style="display:flex; align-items:center; justify-content: center; flex-direction: column; height: 100vh;">
        <h1>Login</h1>
        <form method='post' action='/login'>
            <input style="padding:8px;display:block;border:none;border-bottom:1px solid #ccc;width:100%" type='email' name='email' placeholder='email id' required/><br />
            <br />
            <input style="padding:8px;display:block;border:none;border-bottom:1px solid #ccc;width:100%" type='password' name='password' placeholder='password' required/> <br />
            <br />
            <input type='submit' style="background-color: #4CAF50;border: none;color: white;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 100%" /><br />
        </form>
        <div>Trying login using username: test@test.com password: test </div>
        <div>Another login: username: john@gmail.com passowrd: secret</div>
        <a href='/register'>Register</a>
        <a href='/'>Home</a>
        </div>
    `)
})

app.get('/register', redirectHome, function (req, res, next) {
    res.send(`
    <div style="display:flex; align-items:center; justify-content: center; flex-direction: column; height: 100vh;">
    <h1>Register</h1>
    <form method='post' action='/register'>
        <input style="padding:8px;display:block;border:none;border-bottom:1px solid #ccc;width:100%" type='text' name='name' placeholder=' Name' />
        <br />
        <input style="padding:8px;display:block;border:none;border-bottom:1px solid #ccc;width:100%" type='email' name='email' placeholder='Email Id' />
        <br />
        <input style="padding:8px;display:block;border:none;border-bottom:1px solid #ccc;width:100%" type='password' name='password' placeholder='password' />
        <br />
        <input style="background-color: #4CAF50;border: none;color: white;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 100%" type='submit' />
    </form>
    <a href='/login'>Login</a>
    <a href='/'>Home</a>
    </div>
    `)
});

app.get('/dashboard', redirectLogin, function (req, res, next) {
    const user = users.find(user => user.id === req.session.userId)
    res.send(`
        <div style="display:flex; align-items:center; justify-content: center; flex-direction: column; height: 100vh;">
            <h1>Welcome ${user.name}</h1>
            <ul>
                <li>Name: ${user.name}</li>
                <li>Email: ${user.email}</li>
            </ul>
            <form method="post" action="/logout">
                <button style="background-color: #f44336;border: none;color: white;padding: 15px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px; width: 100%">Logout</button>
            </form>
        </div>
    `)
});

app.post('/login', redirectHome, function (req, res, next) {
    // res.json({ message: 'login username' });
    const { email, password, } = req.body;
    if (email && password && email.trim() && password.trim()) {
        const user = users.find(user => user.email === email && user.password === password);
        if (user) {
            req.session.userId = user.id
            console.log(req.session);
            res.redirect('/dashboard')
        }
        else {
            res.redirect('/login')
        }
    }
});

app.post('/logout', redirectLogin, function (req, res, next) {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/')
        }
        res.clearCookie('sid')
        res.redirect('/')
    })
});

app.post('/register', redirectHome, function (req, res, next) {
    const { name, email, password } = req.body;
    if (name && email && password && email.trim() && password.trim() && name.trim()) {
        let exist = users.some(
            user => user.email === email
        )
        if (!exist) {
            let user = {
                id: users.length + 1,
                name,
                email,
                password
            }
            users.push(user)
            req.session.userId = user.id
            res.redirect('/dashboard')
        }
        // res.status(401).redirect('/api/auth/login')
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})