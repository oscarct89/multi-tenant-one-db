const bcrypt = require('bcrypt');
(async () => {
    const passwordHash = await bcrypt.hash('password2', 10);
    console.log(passwordHash);
})();
