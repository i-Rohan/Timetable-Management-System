var LocalStrategy = require('passport-local').Strategy
var mysql = require('mysql')
var bcrypt = require('bcrypt-nodejs')
var dbconfig = require('./database')
var connection = mysql.createConnection(dbconfig.connection)

connection.query('USE ' + dbconfig.database)

module.exports = function (passport)
{
    passport.use(
        'local-signup',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, username, password, done)
            {
                connection.query('SELECT * FROM users WHERE username = ?',
                    [username], function (err, rows)
                    {
                        if (err)
                            return done(err)
                        if (rows.length)
                        {
                            return done(null, false,
                                req.flash(
                                    'signupMessage',
                                    '{' +
                                    '"status":"error",' +
                                    '"message":"That username is already taken."' +
                                    '}'
                                ))
                        }
                        else
                        {
                            var insertQuery = 'INSERT INTO users ( username, password, name, type ) values (?,?,?,?)'

                            connection.query(insertQuery,
                                [
                                    username.toLowerCase(),
                                    bcrypt.hashSync(password, null, null),
                                    req.body.name,
                                    req.body.type],
                                function ()
                                {
                                    return done(null, null,
                                        req.flash('signupMessage',
                                            '{' +
                                            '"status":"success",' +
                                            '"message":"User successfully added."' +
                                            '}'))
                                })
                        }
                    })
            })
    )
}