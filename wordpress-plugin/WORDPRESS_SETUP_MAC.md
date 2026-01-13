# How to Setup WordPress Locally on Mac

The easiest way to run WordPress on your Mac and test this plugin is to use a free tool called **Local** (formerly Local by Flywheel).

## Option 1: Instant Setup (Recommended)
Since you have Node.js installed, I have started a temporary WordPress server for you.
1.  Check the chat for the URL (likely `http://localhost:8881`).
2.  Log in with user: `admin` and password: `password` (if prompted).
3.  Go to **Pages > Add New** and test the `[coupe_designer]` shortcode.

If you want to run this yourself later:
1.  Open Terminal.
2.  Run: `cd wordpress-plugin/coupe-building-designer`
3.  Run: `npx -y @wp-now/wp-now start`

## Option 2: Install Local (Permanent Setup)
1.  Download **Local** from [localwp.com](https://localwp.com).
2.  Install it by dragging it to your Applications folder.
3.  Open **Local**.

## Step 2: Create a New Site
1.  Click the **+** button in the bottom left corner.
2.  Choose **Create a new site** and click Continue.
3.  Name your site (e.g., "Building Designer Test") and click Continue.
4.  Choose **Preferred** environment and click Continue.
5.  Set up your **WordPress Username** and **Password** (e.g., admin / password).
6.  Click **Add Site**.
7.  *Note: You might be asked for your Mac password to edit the hosts file.*

## Step 3: Install Your Plugin
Now that your site is running, you need to put your plugin code into it.

### Option A: The Zip Method (Easiest)
1.  Go to your project folder `threejs/wordpress-plugin`.
2.  Right-click the `coupe-building-designer` folder and select **Compress "coupe-building-designer"** to create a zip file.
3.  In **Local**, click **WP Admin** to open your WordPress dashboard.
4.  Log in with your username/password.
5.  Go to **Plugins > Add New Plugin**.
6.  Click **Upload Plugin** at the top.
7.  Drag your new zip file there and click **Install Now**.
8.  Click **Activate**.

### Option B: The "Live Link" Method (Best for Development)
If you want to edit code and see changes instantly without re-zipping:
1.  In **Local**, right-click your site in the sidebar and choose **Reveal in Finder**.
2.  Navigate to `app/public/wp-content/plugins`.
3.  Copy your `coupe-building-designer` folder from your development folder into this `plugins` folder.
    *   *Tip: You can use a symbolic link if you are comfortable with terminal, but copying is safer.*
4.  Go to **WP Admin > Plugins** and activate "Coupe Building Designer".

## Step 4: Test the Plugin
1.  In WP Admin, go to **Pages > Add New Page**.
2.  Title it "Designer".
3.  In the content area, type `[coupe_designer]` (or use the Shortcode block).
4.  Click **Publish** (or Update).
5.  Click **View Page**.

You should now see your Building Designer working!
