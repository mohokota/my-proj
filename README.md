### About this repo
- Description: This is my first website created based on what I've learnt from this [course](https://www.udemy.com/course/the-complete-web-development-bootcamp/).
- Languages & Tools: HTML/CSS/JS , Boostrap, Node.js, Postgres

The site is divided into four sections:
  1. Projects
    Under Projects tab, there's a list of mini projects that is unrelated to each other in term of its content and functionality e.g CoinGecko API, random langauge quiz, etc.  

  2. Todo
    This section allows user to add new task to the to-do list and delete it once it is done.

  3. Blog
    This section displays the existing blogs from local database. An application uses REST API to interact with database so that users can create, update, delete or filter blogs directly from the UI. (To make CRUD operations work, ensure local server is running.)

  4. Pricing
    The entire page of this section is styled separately using Bootstrap frontend framework to avoid confusion and class naming conflict with external library.

### Improvement
Additional features or further improvement I want to implement in the future:
- Blog
  - add delete dialog confirmation before user can actually delete it.
  - user can only edit or delete his/her own blog.
  - render blog content with line break.
- Log-in and Sign-up form
  - implement user authentication and session management
  - safely store user's credentials in database.
- Miscellaneous
  - some endpoints may need authentication to restrict access to protected resources.
  - a more effective way to handle server response error.