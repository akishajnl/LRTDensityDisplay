# LRT Crowd Density Tracker

A dynamic web application built for CBAPDEV, designed to provide real-time(to be done in phase 3 haha...) 
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
* **Dynamic Station Maps:** View Northbound and Southbound station lines with color-coded crowd levels (light, moderate, heavy) loaded directly from the database.
* **Detailed Station Views:** Click on any station to view detailed historical crowd data charts, rendered with client-side JavaScript and server-side data.
* **Station Search:** Instantly find any station using the header search bar, which redirects to the correct station detail page.
* **User Authentication:** A complete user authentication system with registration, login, and logout, managed by **`express-session`**.
* **User Profiles:** Users can view their profile and **edit** their information (username, notes).
* **Community Comments:** A live comment feed on the main page for all users.
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

---

## Project Structure

The project follows a clean MVC structure to ensure separation of concerns.
|-- /controllers/ # Contains all business logic for each feature 
|-- /models/ # Contains all Mongoose schemas (User, Station, Comment) 
|-- /public/ # Contains static assets (styles.css) 
|-- /routes/ # Contains all Express.js route definitions 
|-- /views/ # Contains all Handlebars (.hbs) template files 
|-- /data/ # Contains all mock data to populate the database.
|-- .env # Environment variables (DB connection string, secrets) 
|-- package.json # Project dependencies 
|-- server.js # Main server entry point (config, middleware, DB connection)

---

## Setup and Installation

Follow these steps to run the website locally.

### 1. Prerequisites

* [Node.js](https://nodejs.org/) (v18 or higher)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally.

Note: We highly recommend that you create a fresh "connection" using mongodb compass and call it "lrtdb"

### 2. Install Dependencies
In the project's root directory, open up a CMD and run `npm install` to download the dependencies from package.json

### 3. Run The Server
We should now be able to run the server. To do this, run the command `node server.js`. Upon running this command
your cmd should display that your database is connected `✅ MongoDB Connected Successfully!` 
(note: the check mark may or may not be there, it could also be different depending on your mongodb version and your OS)
 and `Server running at http://localhost:3000`.
 
### 4. Import The Sample Data Into Your Database
Navigate to the data folder and inside you will see data packaged into json files.

Open up MongoDB compass and navigate to the documents created by the program named 'comments', 'stations', and 'users'.
Into each document, import the appropriately named .json file to populate your database.

### 5. Restart The Server
In the open CMD of your root directory (done in step 3), press `ctrl+c` to end your server and then retype `node server.js`
This will assure that your server is fully updated with all the changes in your database.

### 6. Check Out The Website!
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
		At the very bottom of the page, you can see comments and reactions, you are unable to react/comment without
		registering and logging in.
	3.3
		At the very top left of every page in our website is search, you need to type in the exact name of the station
		(not case sensitive) and you will be immediately redirected to that station's `station_detail.hbs` 
		You can click on the x to the right of anything you type to clear the form.
	3.3
		From here you can either opt to visit the other main pages by using the navbar on the top right and view:
		`about.hbs`, `login.hbs` and `register.hbs` respectively.
	3.4
		You can also click on any of the lrt platform names or circular color displays to visit `station_detail.hbs`
		all of these views are templated and will change depending on what you click on as each station pulls data
		from the database and displays a chart and has different status depending.
		
		Take note we also feature historical data! You can choose to see other days of data via the dropdown menu!
		
4. Let's register, go on and click the "REGISTER" button on the top right of the webpage to visit `register.hbs`
	4.1
		Input any username (no requirements for now)
		Input your password (also no requirements for now)
		Confirm your password (it has to match.)
	4.2
		After registering, your profile and details will be saved in the database and you can now head on to `login.hbs`
		
5. Let's login, `login.hbs` is most easily accessed through the top right navbar.
	5.1
		Input your login details as you previously registered, it can also be any of the sample data imported prior.
		This will automatically redirect you to `profile.hbs` when successful.
	5.2
		`profile.hbs` is your main view for all your profile details, you'll be able to view details like your badges (currently only assignable via database)
		, you can also see your profile picture (currently unimplementable without deployment in phase 3)
		, you can also edit different details in your profile like your description and username (will also change your login)
		you can't change your username to any other pre-existing account's username (nice try!).
		
6. You can visit the about page called `about.hbs`, it's just cute info about our project with a lot of justification
and reasoning taken from our CBINOV3 needfinding study.

7. Now that you're logged in, you can now head on back to `index.hbs` via the navbar and clicking "HOME".
	7.1 
		You'll now be able to react and comment! Cool!!!
	7.2 
		You can delete any of the comments you made.
	7.3
		You can edit any of the comments you made.
	7.4
		You can only react 1 time per comment, it can be either an upvote or downvote or none!
		
8. That should be all for our project, we hope you can enjoy it!

