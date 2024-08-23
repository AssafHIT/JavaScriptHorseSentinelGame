window.addEventListener('load', function(){
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    //canvas.width = 1000;
    //canvas.height = 500;  

    canvas.width = window.innerWidth * 0.8;

    canvas.height = 500;    
    class InputHandler{
        constructor(game){
            this.game = game;
            // Pressing a key
            window.addEventListener('keydown', e => {
                if ((   (e.key === 'ArrowUp') ||
                        (e.key === "ArrowDown"))
                        && this.game.keys.indexOf(e.key) === -1)
                {
                    this.game.keys.push(e.key);
                }else if (e.key === ' ')
                {
                    this.game.player.shootTop();
                }else if (e.key === 'd') this.game.debug = !this.game.debug;
            });
            
            // Letting go of all keys
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1)
                {
                    // Removing 'key' form the array, if found, using "splice()"
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });

            
        }
    }
    class Projectile{
        constructor(game, x, y)
        {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 10;
            this.markForDeletion = false;
            this.image = document.getElementById('projectile');
        }
        update() 
        {
            this.x += this.speed;
            // If projectile has moved from 80% of the screen area - Delete it:
            if (this.x > this.game.width * 0.8) this.markForDeletion = true;
        }
        draw(context)
        {
            //context.fillStyle = 'yellow';
            //context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x, this.y);
        }
    }
    class Particle{
        constructor(game, x, y)
        {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.sizeModifier * this.spriteSize;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1;
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 100 + 60;

        }
        update()
        {
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX - this.game.speed;
            this.y += this.speedY;
            if (this.y > this.game.height + this.size || this.x < 0 - this.size)
                this.markForDeletion = true;
            if (this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2)
            {
                this.bounced++;
                this.speedY *= -0.5;
            }
        }
        draw(context)
        {
            context.save(); //takes note of the current canvas state
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize,
                 this.spriteSize, this.spriteSize, 0, 0, this.size, this.size);

            context.restore(); //resets to the point of "context.save()"
        }
    }
    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 10;
            this.maxSpeed = 10;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }
        update(deltaTime){
            //Moving the player while staying in bounds:
            if (this.game.keys.includes("ArrowUp") && this.y >= -100 ) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes("ArrowDown") && this.y < (canvas.height - this.height + 100)) this.speedY = this.maxSpeed;
            
            else this.speedY = 0;
            this.y += this.speedY;
           
            // handle projectiles:
            this.projectiles.forEach(projectile =>{
                projectile.update();
            })
            // "filter()" creates a new array
            this.projectiles = this.projectiles.filter(Projectile => !Projectile.markForDeletion);
            // sprite animation
            if (this.frameX < this.maxFrame) this.frameX++
            else this.frameX = 0;

            //Power Up
            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimit){
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }
            

        }

        draw(context){
            
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile =>{
                projectile.draw(context);
            })
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            
        }
        ////////////////////////////////////////////////////////////////////////
        shootTop(){
            if(this.game.ammo > 0)
            {
                if (this.powerUp) this.shootBottom();
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo --;
            }
        }
        shootBottom(){
            if(this.game.ammo > 0)
            {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
                this.game.ammo --;
            }
        }
        
        enterPowerUp(){
            this.powerUpTimer = 0;
            this.powerUp = true;
            if ( this.game.ammo < this.game.maxAmmo) this.game.ammo = this.game.maxAmmo; 
            // this.game.ammo = this.game.maxAmmo;
        }
    }
    class Enemy{
        constructor(game)
        {
            this.game = game;
            this.x = this.game.width;
            this.speedX = -6*(Math.random());
            this.markForDeletion = false;
            
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }
        update()
        {
            this.x += this.speedX - this.game.speed;
            if(this.x + this.width < 0) this.markForDeletion = true;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
        draw(context)
        {
            
            if (this.game.debug)
            {
                context.strokeRect(this.x, this.y, this.width, this.height);
                context.fillText(this.lives, this.x, this.y);
            }
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            context.font = '20px Helvetica';
        }
    }
    class Angler1 extends Enemy
    {
        constructor(game) {
            super(game);// makes sure that the parent's constructor gets executed.
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random()*3); // Choose enemy type 1-3 randomly
            this.lives = 2;
            this.score = this.lives;
        }
    }
    class Angler2 extends Enemy
    {
        constructor(game) {
            super(game);// makes sure that the parent's constructor gets executed.
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random()*2); // Choose enemy type 1-2 randomly
            this.lives = 3;
            this.score = this.lives;
        }
    }
    class LuckyFish extends Enemy
    {
        constructor(game) {
            super(game);// makes sure that the parent's constructor gets executed.
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random()*2); // Choose enemy type 1-2 randomly
            this.lives = 3;
            this.score = 15;
            this.type = 'lucky';
        }
    }

    class HiveWhale extends Enemy
    {
        constructor(game) {
            super(game);// makes sure that the parent's constructor gets executed.
            this.width = 400;
            this.height = 227;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('hive');
            this.frameY = 0;
            this.lives = 10;
            this.score = this.lives;
            this.type = 'hive';
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    }

    class Drone extends Enemy
    {
        constructor(game, x, y) {
            super(game);// makes sure that the parent's constructor gets executed.
            this.width = 115;
            this.height = 95;
            this.y = y;
            this.x = x;
            this.image = document.getElementById('drone');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = this.lives;
            this.type = 'drone';
            this.speedX = Math.random() * -4.2 - 0.5;
        }
    }

    class Layer{
        constructor(game, image, speedModifier)
        {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update()
        {
                    // Movement:
         // if background img has moved across the screen, x = 0 so it can scroll again
            if(this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context)
        {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y); // Second instance of the background image, positioned immediately to the right of the first one
        }
    }
    class Background{
        constructor(game)
        {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1.5);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update()
        {
            this.layers.forEach(layer => layer.update());
        }
        draw(context)
        {
            this.layers.forEach(layer => layer.draw(context));
        }
    }
    
    class Explosion {
        constructor(game, x, y)
        {
            this.game = game;
            this.frameX = 0;
            this.spriteHeight = 200;
            this.fps = 15;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.markForDeletion = false;
            this.maxFrame = 8;
        }
        update(deltaTime){
            this.x -= this.game.speed;
            if (this.timer > this.interval){
                this.frameX++;
                this.timer = 0;
            }else {
                this.timer += deltaTime;
            }
            
            if (this.frameX > this.maxFrame) this.markForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        
        }
    }
    class smokeExplosion extends Explosion{
        constructor(game, x, y)
        {
            super(game, x, y);
            this.image = document.getElementById('smoke');
            this.spriteWidth = 200;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width*0.5;
            this.y = y - this.height*0.5;
        }
    }
    class fireExplosion extends Explosion{
       
    }
    
    
    class UI{
        constructor(game)
        {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'white';
        }
        draw(context){
            //Using 'save()' and 'restore()' to apply changes only to "Score/Ammo" UI
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;
            //score
            context.fillText("Score: " + this.game.score, 20, 40);
           
            // Timer
            // Converting game time into seconds
            context.font = '22px' + this.fontFamily;
            context.fillText("Timer: " + Math.floor(this.game.gameTime / 1000), 20, 95);
           
            
            //Game Over message:
            if(this.game.gameOver)
            {
                context.textAlign = 'center';
                let message1;
                let message2;
                if(this.game.score >= this.game.winningScore)
                {
                    message1 = 'YOU WIN';
                    message2 = 'Well Done';
                }else{
                    message1 = 'You Lose';
                    message2 = 'Better Luck Next Time';
                }
                context.font = '100px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height*0.5 - 20);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height*0.5 + 20);
            }
            //ammo 
            for (let i = 0; i < this.game.ammo; i++)
                {
                    // 20 pixles leftMargin + 5 spacing
                    context.fillRect(20 + 5*i, 50, 3, 20);
                    if (this.game.player.powerUp) context.fillStyle = '#ffffbd';
                }
            context.restore();
            

        }

    }
    class Game{
        constructor(width, height)
        {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];
            this.explosions = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.score = 0;
            this.winningScore = 50;
            this.gameTime = 0;
            this.timeLimit = 60000;
            this.gameOver = false;
            this.speed = 1;
            this.debug = false;
        }
        update(deltaTime)
        {
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.player.update(deltaTime);
            this.background.update();
            this.background.layer4.update()
            if (this.ammoTimer > this.ammoInterval)
            {
                if (this.ammo < this.maxAmmo){
                    this.ammo++;
                    this.ammoTimer = 0;
                } 
            }else{
                this.ammoTimer += deltaTime;
            }

            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markForDeletion);
            this.explosions.forEach(explosion => explosion.update(deltaTime));
            this.explosions = this.explosions.filter(explosion => !explosion.markForDeletion);

            this.enemies.forEach(enemy =>{
                enemy.update();
                if(this.checkCollision(this.player, enemy)){
                    enemy.markForDeletion = true;
                    this.addExplosion(enemy);
                    for(let i = 0; i < enemy.score; i++)
                        {
                            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        }
                    if (enemy.type === 'lucky') this.player.enterPowerUp();
                    else this.score--;
                }
                this.player.projectiles.forEach(projectile => {
                    if(this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markForDeletion = true;
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        if(enemy.lives <= 0){
                            enemy.markForDeletion = true;
                            this.addExplosion(enemy);
                            if(enemy.type === 'hive')
                            {
                                for(let i = 0; i < 5; i++) this.enemies.push(new Drone
                                    (this, enemy.x + Math.random()*enemy.width, 
                                    enemy.y + Math.random()*enemy.height*0.5));
                                
                            }
                            if (!this.gameOver) this.score += enemy.score;
                            if (this.score >= this.winningScore) this.gameOver = true; 
                        }
                            
                    }
                        
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markForDeletion);
            if(this.enemyTimer > this.enemyInterval && !this.gameOver)
            {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        }
        draw(context)
        {
            this.background.draw(context);
            this.player.draw(context);
            this.particles.forEach(particle => particle.draw(context));

            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.explosions.forEach(explosion => explosion.draw(context));

            this.background.layer4.draw(context);
            this.ui.draw(context);
        }
        addEnemy(){
            const randomize = Math.random();
            if (randomize < 0.3) this.enemies.push(new Angler1(this));
            else if (randomize > 0.3 && randomize < 0.6) this.enemies.push(new Angler2(this));
            else if (randomize > 0.6 && randomize < 0.8) this.enemies.push(new HiveWhale(this));
            else this.enemies.push(new LuckyFish(this));
            
        }
        addExplosion(enemy){
            const randomize = Math.random();
            if(randomize < 1) this.explosions.push(new smokeExplosion(this, enemy.x+enemy.width*0.5, enemy.y+enemy.height*0.5));
            
        }
        checkCollision(rect1, rect2)
        {
            return ( 
                rect1.x < rect2.x + rect2.width && 
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y
            )
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    // animation loop
    function animate(timeStamp){
        // Difference in milliseconds between the timestamp from this loop and timestamp from previous loop:
        // Now we know how many milliseconds it takes to render one animation loop
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.draw(ctx);
        game.update(deltaTime);

        requestAnimationFrame(animate)
    }
    animate(0);
})