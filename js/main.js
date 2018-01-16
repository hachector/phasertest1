var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaserGame', { preload: preload, create: create, update: update });

var score = 0;
var scoreText;
var player;
var platforms;
var cursors;
var platforms2;

function preload() {

	game.load.image('sky', 'assets/sky.png');
	game.load.image('cloud0', 'assets/cloud-big-2x.png');
	game.load.image('cloud1', 'assets/cloud-narrow-2x.png');
	game.load.image('cloud2', 'assets/cloud-small-2x2.png');
    game.load.image('ground', 'assets/platform.png');
	game.load.image('river', 'assets/river.png');
    game.load.image('star', 'assets/star.png');
	game.load.image('ice', 'assets/platform_ice2.png');
    game.load.image('grass', 'assets/platform_grass2.png');	
	
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

}

function create() {

	//  Make the world larger than the actual canvas
    game.world.setBounds(0, 0, 1400, 600);

	//  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
	
	//  A simple background for our game
    game.add.tileSprite(0, 0, 1400, 600, 'sky');
	game.add.sprite(50, game.world.height - 320, 'cloud0');
	game.add.sprite(400, game.world.height - 128, 'cloud1');
	game.add.sprite(900, game.world.height - 320, 'cloud2');
	
	// Se añade desde la posicion 0,0 -> Esquina superior izquierda
	
	//  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();
	// Es un grupo para que compartan todas las propiedades

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;
	// Hace que cada elemento de este grupo tenga acceso a la propiedad Body
	
	// Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');
	// Se crea en la posicion 0 (a la izquierda en horizontal), y en vertical al
	// total del mundo (600) menos dos veces el tamaño vertical del sprite del suelo (32x2=64)
	// el tercer elemento es el asset del preload.
	
	game.add.sprite(0, game.world.height - 64, 'river');
	// El rio tiene que estar generado después del suelo, ya que se generan del fondo hacia afuera
	
	//  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(4, 2);
	// Se le da el doble de tamaño tanto horizontal como vertical.
	
	//  This stops it from falling away when you jump on it
    ground.body.immovable = true;
	// Immovable es para que no se mueva cuando otros objetos colisionen con el.

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;
	// Como se puede ver, una vez creado la variable ledge, se puede usar varias veces para
	//crear elementos distintos con platforms.create
	
	//-----------------------------------------------------------------------------------------
	//-------------------------- Hasta aquí, la creación del "Mundo" --------------------------
	//-----------------------------------------------------------------------------------------
	
	
	// The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');
	// Genera el sprite del jugador

	//  We need to enable physics on the player
    game.physics.arcade.enable(player);
	// Se añaden "físicas arcade" para tener acceso, entre otros, a las animaciones y movimiento
	
	//  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.1;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
	
	//  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
	
	game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON);
	//game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);
	//game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN);
	//game.camera.follow(player, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
	//creamos una camara que siga al jugador
	
	//-----------------------------------------------------------------------------------------
	//------------------------- Hasta aquí, la creación del Personaje -------------------------
	//-----------------------------------------------------------------------------------------
	
	
	stars = game.add.group();

    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 15;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
	
	// Puntuacion, es un simple texto que se irá actualizando en la funcion update
    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
	//con fixedToCamera hacemos que el texto se mueva con la cámara
	scoreText.fixedToCamera = true;
	
	//-----------------------------------------------------------------------------------------
	//------------------------ Hasta aquí, la creación de las estrellas -----------------------
	//-----------------------------------------------------------------------------------------
	
	
	platforms2 = game.add.physicsGroup();

	var grass = platforms2.create(800, 350, 'grass');
	var ice = platforms2.create(1100, 400, 'ice');
	ice.body.friction.x = 0;
	ice = platforms2.create(1200, 400, 'ice');
	ice.body.friction.x = 0;
	
	platforms2.setAll('body.immovable', true);
	//platforms2.setAll('body.velocity.x', 100);
	// OJO con estas cosas, las propiedades se dan DESPUÉS de crearlas, no antes.
	
	//-----------------------------------------------------------------------------------------
	//----------- Hasta aquí, la creación de 2 nuevas plataformas, "hierba" y hielo -----------
	//-----------------------------------------------------------------------------------------
	
	cursors = game.input.keyboard.createCursorKeys();
	// Se crea "cursors" para poder usar el teclado
	
}

function update() {

	//  Collide the player and the stars with the platforms
    var hitPlatform = game.physics.arcade.collide(player, platforms);
	var hitPlatform2 = game.physics.arcade.collide(player, platforms2);
	// MUY IMPORTANTE: hace que los sprites del player y el grupo platforms y platforms2 puedan interactuar
	
	//  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down && ( hitPlatform || hitPlatform2) )
    {
        player.body.velocity.y = -350;
    }
	
	//-----------------------------------------------------------------------------------------
	//----------------------- Hasta aquí, la interacción del Personaje ------------------------
	//-----------------------------------------------------------------------------------------
	
	
	game.physics.arcade.collide(stars, platforms);
	game.physics.arcade.collide(stars, platforms2);
	// MUY IMPORTANTE: Habilitamos la interacción entre las estrellas y las plataformas
	
	// This tells Phaser to check for an overlap between the player and any star in the stars Group. 
	game.physics.arcade.overlap(player, stars, collectStar);
	
	function collectStar (player, star) {

		// Removes the star from the screen
		star.kill();

		//  Add and update the score
		score += 10;
		scoreText.text = 'Score: ' + score;

	}

	
	//-----------------------------------------------------------------------------------------
	//---------------------- Hasta aquí, la interacción de las estrellas ----------------------
	//-----------------------------------------------------------------------------------------


}