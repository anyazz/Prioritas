from library50 import cs50
from flask import Flask, flash, redirect, render_template, request, session, url_for, jsonify
from flask_session import Session
from passlib.apps import custom_app_context as pwd_context
from tempfile import gettempdir
from time import gmtime, strftime
import random
import string
import smtplib
import csv
# import urllib.request
from functools import wraps
import sqlalchemy


# taken from CS50 Python Library due to issues with importing
class SQL(object):
    """TODO"""

    def __init__(self, url):
        """TODO"""
        try:
            self.engine = sqlalchemy.create_engine(url)
        except Exception as e:
            raise RuntimeError(e)

    def execute(self, text, *multiparams, **params):
        """TODO"""
        try:

            # http://docs.sqlalchemy.org/en/latest/core/sqlelement.html#sqlalchemy.sql.expression.text
            # https://groups.google.com/forum/#!topic/sqlalchemy/FfLwKT1yQlg
            # http://docs.sqlalchemy.org/en/latest/core/connections.html#sqlalchemy.engine.Engine.execute
            # http://docs.sqlalchemy.org/en/latest/faq/sqlexpressions.html#how-do-i-render-sql-expressions-as-strings-possibly-with-bound-parameters-inlined
            statement = sqlalchemy.text(text).bindparams(*multiparams, **params)
            result = self.engine.execute(str(statement.compile(compile_kwargs={"literal_binds": True})))

            # SELECT
            if result.returns_rows:
                rows = result.fetchall()
                return [dict(row) for row in rows]

            # INSERT
            elif result.lastrowid is not None:
                return result.lastrowid

            # DELETE, UPDATE
            else:
                return result.rowcount

        except sqlalchemy.exc.IntegrityError:
            return None

        except Exception as e:
            raise RuntimeError(e)




# configure application
app = Flask(__name__)

# ensure responses aren't cached
if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        return response

# configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = gettempdir()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# configure CS50 Library to use SQLite database
db = SQL("sqlite:///projectv2.db")

def login_required(f):
    """
    Decorate routes to require login.

    http://flask.pocoo.org/docs/0.11/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect(url_for("login", next=request.url))
        return f(*args, **kwargs)
    return decorated_function
    
@app.route("/", methods=["GET", "POST"])
@login_required
def index():
    """Home page."""
    # get todos for user
    rows = db.execute("SELECT todo, category FROM todos WHERE user_id = :id ", id = session["user_id"])

    # initialize index table

    list1, list2, list3, list4 = [], [], [], []
    #store table values
    for i in range(len(rows)):
        if rows[i]["category"] == 1:
            list1.append(rows[i]["todo"])
        if rows[i]["category"] == 2:
            list2.append(rows[i]["todo"])
        if rows[i]["category"] == 3:
            list3.append(rows[i]["todo"])
        if rows[i]["category"] == 4:
            list4.append(rows[i]["todo"])

    # return
    return render_template("index.html", list1 = list1, list2 = list2, list3 = list3, list4 = list4)

@app.route("/about")
def about():
    """About me page"""
    return render_template("about.html")
    
@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in."""

    # forget any user_id
    session.clear()

    # if user reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        

        # ensure username was submitted
        if not request.form.get("username"):
            return render_template("login.html")

        # ensure password was submitted
        elif not request.form.get("password"):
            return render_template("login.html")

        # query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username", username=request.form.get("username"))

        # ensure username exists and password is correct
        if len(rows) != 1 or not pwd_context.verify(request.form.get("password"), rows[0]["hash"]):
            return render_template("incorrect_pass.html")

        # remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # redirect user to home page
        return redirect(url_for("index"))

    # else if user reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")



@app.route("/forgot_pass", methods=["GET", "POST"])
def forgot_pass():
    """Send User Password"""
    if request.method == "POST":
        
        # ensure email was submitted
        if not request.form.get("username"):
            return render_template("forgot_pass.html")
        
        #query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username", username=request.form.get("username"))
        
        #ensure username exists
        if len(rows) == 0:
            return render_template("reset_failed.html")
        
        #change password & send email
        else:
            new_pass = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(8))
            db.execute("UPDATE users SET hash = :hash WHERE id = :id", hash = pwd_context.encrypt(new_pass), id = rows[0]["id"])
            sender = 'prioritas.cs50@gmail.com'
            receivers = [rows[0]["username"]]

            message = """Subject: Password Reset

            \nHi! Your new password is below. 
            
            \nNew Password: {}
            
            \nPlease login with your reset password. If you wish to change this temporary password, click "change password" once you are logged in. 
            """.format(new_pass)

            try:
                smtpObj = smtplib.SMTP('smtp.gmail.com', 587)
                type(smtpObj)
                smtpObj.ehlo()
                smtpObj.starttls()
                smtpObj.login(' prioritas.cs50@gmail.com ', ' prioritas ')
                smtpObj.sendmail(sender, receivers, message)
                smtpObj.quit()
                return render_template("reset_success.html")
            except smtplib.SMTPException:
                return render_template("reset_failed.html")
                
    else:
        return render_template("forgot_pass.html")

@app.route("/incorrect_pass", methods=["GET", "POST"])
def incorrect_pass():
    """Display for incorrect passwords."""
    if request.method == "POST":
        return login()
    else:
        return render_template("incorrect_pass.html")

@app.route("/logout")
def logout():
    """Log user out."""

    # forget any user_id
    session.clear()

    # redirect user to login form
    return redirect(url_for("login"))


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user."""
    
    # forget any user_id
    session.clear()

    # if user reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username", username=request.form.get("username"))

        # ensure username does not already exist
        if len(rows) != 0:
            return render_template("username_taken.html")
        
        # add user to users
        db.execute("INSERT INTO users (username, hash) VALUES(:username, :hash)", username=request.form.get("username"), hash = pwd_context.encrypt(request.form["password"]))
        
        # update existing session
        rows = db.execute("SELECT * FROM users WHERE username = :username", username=request.form.get("username"))
        session["user_id"] = rows[0]["id"]

        
        # Let user know registration successful
        return render_template("register_success.html")

    # else if user reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("register.html")

        
@app.route("/password", methods=["GET", "POST"])
@login_required
def password():
    """Change password."""

     # if user reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        
        # ensure old password was submitted
        if not request.form.get("old"):
            return apology("please provide current password")
        
        # ensure old password is correct
        rows = db.execute("SELECT * FROM users WHERE id = :id", id = session["user_id"])
        if not pwd_context.verify(request.form.get("old"), rows[0]["hash"]):
            return apology("Current password incorrect")
        
        # ensure new password was submitted
        elif not request.form.get("new") or not request.form.get("new2"):
            return apology("must provide new password")
        
        # ensure new passwords are equal
        elif not request.form.get("new") == request.form.get("new2"):
            return apology("passwords don't match")    

        # update database
        db.execute("UPDATE users SET hash = :hash WHERE id = :id", hash = pwd_context.encrypt(request.form.get("new2")), id = session["user_id"])

        # redirect user to home page
        return redirect(url_for("index"))
    # else if user reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("password.html")

@app.route("/saveTodo")
def saveTodo():
    """Save user-inputted task to SQL."""

    # add todo & corresponding data to table
    db.execute("INSERT INTO todos (user_id, todo, category) VALUES (:id, :todo, :category)", id=session["user_id"], todo=request.args.get("todo"), category=request.args.get("category"))
    return jsonify(dict());
    
@app.route("/removeTodo")
def removeTodo():
    """Delete task from SQL."""

    # remove todo & corresponding data from table
    db.execute("DELETE FROM todos WHERE (user_id = :id AND todo = :todo AND category = :category)", id=session["user_id"], todo=request.args.get("todo"), category=request.args.get("category"))
    return jsonify(dict());

@app.route("/updateTime")
def updateTime():
    
    
    # update number of pomorodos for todo 
    db.execute("UPDATE todos SET pomodoros = :pomodoros WHERE (user_id = :id AND todo = :todo AND category = :category)", pomodoros=request.args.get("pomodoros"), id=session["user_id"], todo=request.args.get("todo"), 
    category=request.args.get("category"))
    return jsonify(dict());


@app.route("/getTime")
def getTime():
    # get number of pomodoros for todo
    time = db.execute("SELECT pomodoros FROM todos WHERE (user_id = :id AND todo = :todo AND category = :category)", id=session["user_id"], todo=request.args.get("todo"), 
    category=request.args.get("category"))
    return jsonify(time)

# if __name__ == '__main__':
#     app.debug = True
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host='0.0.0.0', port=port)

