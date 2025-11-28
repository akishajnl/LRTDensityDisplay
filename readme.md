# LRT Crowd Density Tracker

A dynamic web application built for CBAPDEV, designed to provide real-time(ideally in the future) 
and historical crowd density information for LRT-1 stations. 
It helps commuters make informed decisions by visualizing crowd levels and includes a full-featured user authentication 
and community-driven comment system.

**Developed by:**
* AKISHA JENEILLE C. AFRICA
* ED BENNETT L. BORROMEO
* RIENZEL KRISTIAN P. GALANG

---

## Features

* **MVC Architecture:** The project is fully organized using the **Model-View-Controller (MVC)** pattern, separating database logic, routing, and view rendering.
* **Static Station Maps:** View Northbound and Southbound station lines with color-coded crowd levels (light, moderate, heavy) loaded directly from the database.
* **Detailed Station Views:** Click on any station to view detailed historical crowd data charts, rendered with client-side JavaScript and server-side data.
* **Station Search:** Instantly find any station using the header search bar, which redirects to the correct station detail page.
* **User Authentication:** A complete user authentication system with registration, login, and logout, managed by **`express-session`**.
* **User Profiles:** Users can view their profile, **edit** their information (username, notes) and **delete** their account.
* **Community Comments:** A live comment feed on each platform for all users to see, even if they are not logged in.
* **Reddit-Style Reactions:**
    * Upvote or downvote comments.
    * Users can **change** their vote (e.g., from up to down).
    * Users can **remove** their vote by clicking the same reaction again.
    * The system is secured on the backend to prevent duplicate votes.
* **Full Comment Control:**
    * Users can **edit** their own comments.
    * Users can **delete** their own comments.

---

## Technology Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose (ODM)
* **View Engine:** Handlebars (`hbs`)
* **Authentication:** `express-session`
* **Styling:** Tailwind CSS (via CDN) & Custom CSS
* **Environment:** `dotenv`
* **Deployment:** 'onrender'

---

## Project Structure

The project follows a clean MVC structure to ensure separation of concerns.
|-- /controllers/ # Contains all business logic for each feature 
|-- /models/ # Contains all Mongoose schemas (User, Station, Comment) 
|-- /public/ # Contains static assets (styles.css) 
|-- /routes/ # Contains all Express.js route definitions 
|-- /views/ # Contains all Handlebars (.hbs) template files 
|-- .env # Environment variables (DB connection string, secrets) 
|-- package.json # Project dependencies 
|-- server.js # Main server entry point (config, middleware, DB connection)

---

## Setup and Installation

Follow these steps to run the website locally.

### 1. Prerequisites

* There is no need to install anything since our website is deployed and can be accessed through this link:
https://lrtwebsite.onrender.com/

Continue reading if you want to run it locally. 

### 2. Install Dependencies
In the project's root directory, open up a CMD and run `npm install` to download the dependencies from package.json

### NPM Packages Used
Run this command to install all of this
 **npm install bcrypt dotenv express express-session hbs moment mongodb mongoose multer node sharp**
 
	"bcrypt": "^6.0.0",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "express-session": "^1.18.2",
    "hbs": "^4.2.0",
    "moment": "^2.30.1",
    "mongodb": "^7.0.0",
    "mongoose": "^8.19.3",
    "multer": "^2.0.2",
    "node": "^25.1.0",
    "server.js": "^1.0.0",
    "sharp": "^0.34.5"
	
### 3. Run The Server
We should now be able to run the server. To do this, run the command `node server.js`. Upon running this command
your cmd should display that your database is connected `✅ MongoDB Connected Successfully!` 
(note: the check mark may or may not be there, it could also be different depending on your OS)
 and `Server running at http://localhost:3000`.

### 4. Check Out The Website!
Access the website by going to the URL:
```
http://localhost:3000
```

### 7. What Is The Website About? (A guide to exploration)

1. When first launching the website you'll be greeted by the landing page `index.hbs`

2. From here you can actually explore the entirety of the website except for the `profile.hbs` page.

3. On the landing page you see two of our main CRUDs and search (viewable from any page),
   
	3.1 
		At the forefront of the page, the crowding level display for each station is shown, Northbound and Southbound.
		note: Northbound and Southbound are entirely different in the database and are not the same, crowding level is
		displayed with color and these colors change dynamically depending on numerical data from the database.

	3.2 
		At the very top left of every page in our website is search, you need to type in the exact name of the station
		(not case sensitive) or even just a word of the station and not the whole thing, and you will be immediately redirected to that station's `station_detail.hbs` 
		You can click on the x to the right of anything you type to clear the form.

	3.3
		From here you can either opt to visit the other main pages by using the navbar on the top right and view:
		`about.hbs`, `login.hbs` and `register.hbs` respectively.

	3.4
		You can also click on any of the lrt platform names or circular color displays to visit `station_detail.hbs`
		all of these views are templated and will change depending on what you click on as each station pulls data
		from the database and displays a chart and has different status depending.

	3.5
		Take note we also feature historical data! You can choose to see other days of data via the dropdown menu and 
		the '<' and '>' buttons.

	3.6
		**Comments** can be seen along with the historical data, in the `station_detail.hbs` to be specific. Logged in users can comment, react to themselves and to others, and edit and delete their own comments. Not logged in users can still see the comments but they are not able to interact. Admin can react and delete comments. 
		
5. Let's register, go on and click the "REGISTER" button on the top right of the webpage to visit `register.hbs`
	4.1
		Input any username (no requirements as long as unique)
		Input your password (there is a Weak, Good, and Strong password defined in the website, password needs to be good or strong)
		Confirm your password (it has to match)
	4.2
		After registering, your profile and details will be saved in the database and you can now head on to `login.hbs`
		
6. Let's login, `login.hbs` is most easily accessed through the top right navbar.
	5.1
		Input your login details as you previously registered, it can also be any of the sample data made prior.
		This will automatically redirect you to `profile.hbs` when successful.
		
	5.2 These are the pre made account credentials we made:
		Username: admin
		Password: Admin123

		Username: commuter_chad
		Password: Chad12345

		Username:rnzl
		Password:Rienzel123
		
		Username:ed19
		Password:EdBorromeo19

		Username: aki18
		Password: Akisha123

	5.3.
		`profile.hbs` is your main view for all your profile details, you'll be able to view details like your badges (currently only assignable via database)
		, you can also see your profile picture
		, you can also edit different details in your profile like your description, username, and profile picture (will also change your login)
		you can't change your username to any other pre-existing account's username (nice try!). You can delete your account!
		
7. You can visit the about page called `about.hbs`, it's just cute info about our project with a lot of justification
and reasoning taken from our CBINOV3 needfinding study.

8. Now that you're logged in, you can now head on back to `index.hbs` via the navbar and clicking "HOME".
	7.1 
		You'll now be able to react and comment! Cool!!!
	7.2 
		You can delete any of the comments you made.
	7.3
		You can edit any of the comments you made.
	7.4
		You can only react 1 time per comment, it can be either an upvote or downvote or none!
		
9. That should be all for our project, we hope you can enjoy it!




