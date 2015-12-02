# Wildstar Interactive HTML5 Map

## Installing
In order to build you need to install all necessary modules via npm.
(If you do not have node installed, please visit http://nodejs.org/ before
proceeding.)

As the npm-package **canvas** is used, you might need *libcairo*
as well as *libjpeg*, *libpng* and *libgif*.
Please refer to https://github.com/automattic/node-canvas
for instructions on how to install or if you are on debian/ubuntu, just type:
```sh
$ sudo apt-get install libcairo-dev libjpeg-dev libpng-dev libgif-dev
```

Once you have node and the dependencies for canvas installed, you may proceed to
install all needed packages by typing:

```sh
$ npm install
```

##Building
There are several steps you need to take in order to build the map:
1. Creating the map
2. Building the client
3. Linking or copying the client into your webroot
4. Setting up the database
5. Setting up the server

I will explain each step to you in detail now:

###1. Creating the Map
After cloning the repository the whole map will be in the folder `original/`
just the way it was extracted from the game but converted from *.tex* to *.png*.

In order to use the map on the web it will have to be assembled and then
disassembled into several levels of zoom (default: 8).

This step will take its time, so type
```sh
$ grunt maps
```
and go make some pizza, go for a walk or browse some imageboards.
After the map was created there will be a folder `htdocs/` with the two
subdirectories `htdocs/map_east/` and `htdocs/map_west/` which contain the
actual map just the way the clients will download it later on as well as a
directory `big/` which will contain two **large** images (the assembled maps)
which you might delet if you are spare on diskspace, print out and pin on your
wall or set as wallpaper.


###2. Building the client
This is probably the most simple step of the whole process, just type
```sh
$ grunt client
```
in order to build the client (uglify the javascript, compile the less-sources to
css and copy everything significant into the `htdocs/` directory.)
After you did this, the `htdocs/` directory will contain all necessary files to
be hosted on the web.

###3. Linking or copying the client into your webroot
After step 2 the client should be ready built in the `htdocs/` directory and now
just needs to be published somehow. The easiest way is definitly to just link it
into your webroot, on **debian** with **apache2** as simple
```sh
$ ln -s /absolute/path/to/repository/htdocs /var/www/wildstar
```
will do, but feel free to create virtual hosts or even copy the whole folder
somewhere else.

###4. Setting up the database
There is a server which will provide all locations on the map as well as their
vote-scores and categories via HTML5-Websockets. It has to be constantly running
in order for the website to work. All it's data will be stored in an
mysql-database.

There should be a file named `database_config.json` which has to contain all
significant data to connect to your database.
An example-file would look like this:
```json
{
    "host": "localhost",
    "user": "<user>",
    "password": "<password>",
    "database" : "<database>"
}
```
(You of course need to replace of **<user>**, **<password>** and **<database>**
with the correct information to log into your database.)

All tables will be created automatically after typing:
```sh
$ grunt setup-database
```
This command will not only create the tables but also create all categories in
the category table.

###5. Setting up the server
After the database was setup successfully you now have to configure the server.
Typing
```sh
$ grunt serverconfig
```
Will create a new example-configuration which should be suiting perfectly for
most users.
it will look somehow like this:
```json
{
    "port": 45673,
    "host": "0.0.0.0",
    "htdocsDirectory": "./htdocs/"
}
```
If you copied the `htdocs/` directory instead of linking it, you need to set the
absolute path inside this config-file in order to enable the server to tell the
client on which port it has to connect.
Alternativly (or if you cannot allow the server to write into the clients
directory) you can do this manually by creating a file named `port.js` in the
same folder the `index.html` is contained.

Paste the following into this file:
```javascript
/*
 * This file tells the client on which port it has to connect
 */

var _port = 0;

```
And change the value of `_port` to your respective portnumber.

##Running
After setting up everything you may start the server by typing
```sh
$ node server/server.js
```
which will start the server. If everything goes fine it should look somehow like
this:
```sh
$ node server/server.js
Connecting to Database ... Done.
Starting websocketserver ... Done.
```
After the server was started you can now access the map depending on how you
integrated it into your webroot. If you just linked it,
http://localhost/wildstar should work just fine. If you get permission-problems,
you might need to add global reading-permissions to your `htdocs/` directory
```sh
$ chmod ugo+r htdocs/ -R
```
Please keep in mind, that the server needs to write into this directory in order
to tell the client the correct port so if you `chown` the directory, make sure
the user the server runs with has permission to write into it.
