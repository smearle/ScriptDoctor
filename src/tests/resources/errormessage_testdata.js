var errormessage_testdata = [
    [
        `Background missing`,
        ["title Simple Block Pushing Game\nauthor David Skinner\nhomepage www.puzzlescript.net\n\n========\nOBJECTS\n========\n\n\nTarget\nDarkBlue\n.....\n.000.\n.0.0.\n.000.\n.....\n\nWall\nBROWN DARKBROWN\n00010\n11111\n01000\n11111\n00010\n\nPlayer\nBlack Orange White Blue\n.000.\n.111.\n22222\n.333.\n.3.3.\n\nCrate\nOrange Yellow\n00000\n0...0\n0...0\n0...0\n00000\n\n\n=======\nLEGEND\n=======\n\n. = target\n# = Wall\nP = Player\n* = Crate\n@ = Crate and Target\nO = Target\n\n\n=======\nSOUNDS\n=======\n\nCrate MOVE 36772507\n\n================\nCOLLISIONLAYERS\n================\n\nTarget\nPlayer, Wall, Crate\n\n======\nRULES\n======\n\n[ > Player | Crate ] -> [ > Player | > Crate ]\n\n==============\nWINCONDITIONS\n==============\n\nAll Target on Crate\n\n=======\nLEVELS\n=======\n\n\n####..\n#.O#..\n#..###\n#@P..#\n#..*.#\n#..###\n####..\n\n\n######\n#....#\n#.#P.#\n#.*@.#\n#.O@.#\n#....#\n######\n\n",["you have to define something to be the background"]]
    ],
    [
        `Player missing`,
        ["title Simple Block Pushing Game\nauthor David Skinner\nhomepage www.puzzlescript.net\n\n========\nOBJECTS\n========\n\nBackground\nLIGHTGREEN GREEN\n11111\n01111\n11101\n11111\n10111\n\n\nTarget\nDarkBlue\n.....\n.000.\n.0.0.\n.000.\n.....\n\nWall\nBROWN DARKBROWN\n00010\n11111\n01000\n11111\n00010\n\nPlayer2\nBlack Orange White Blue\n.000.\n.111.\n22222\n.333.\n.3.3.\n\nCrate\nOrange Yellow\n00000\n0...0\n0...0\n0...0\n00000\n\n\n=======\nLEGEND\n=======\n\n. = Background\n# = Wall\nP = Player2\n* = Crate\n@ = Crate and Target\nO = Target\n\n\n=======\nSOUNDS\n=======\n\nCrate MOVE 36772507\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nTarget\nPlayer2, Wall, Crate\n\n======\nRULES\n======\n\n[ > Player2 | Crate ] -> [ > Player2 | > Crate ]\n\n==============\nWINCONDITIONS\n==============\n\nAll Target on Crate\n\n=======\nLEVELS\n=======\n\n\n####..\n#.O#..\n#..###\n#@P..#\n#..*.#\n#..###\n####..\n\n\n######\n#....#\n#.#P.#\n#.*@.#\n#.O@.#\n#....#\n######\n\n",["error, didn't find any object called player, either in the objects section, or the legends section. there must be a player!"]]
    ],
    [
		"Sprites must be 5 wide and 5 high.",
        ["title Bloygizpo\nauthor increpare\nhomepage www.puzzlescript.net\nverbose_logging\ndebug\n\n========\nOBJECTS\n========\n\nBackground\ngreen GREEN\n11111\n01111\n11101\n11111\n10111\n\n\nTarget\nDarkBlue\n.....\n.000.\n.0.0.\n.000.\n.....\n\n\nTarget_aktiviert\nyellow\n.....\n.000.\n.0.0.\n.000.1\n.....\n\nWall1\ndarkbrown darkbrown\n0.0.0\n.1.1.\n0.0.0\n.1.1.\n0.0.0\n\nWall2\ndarkbrown darkbrown\n.0.1.\n1.1.1\n.1.0.\n1.1.1\n.0.1.\n\nPlayer1\nBlack Orange White Blue\n..0..\n.1.1.\n2.2.2\n.3.3.\n.....\n\nPlayer2\nBlack Orange White Blue\n.0.0.\n..1..\n.2.2.\n..3..\n.3.3.\n\n\nCrate1\nOrange Yellow\n0.0.0\n.....\n0...0\n.....\n0.0.0\n\n\nCrate2\nOrange Yellow\n.0.0.\n0...0\n.....\n0...0\n.0.0.\n\nTuer1\nBlack brown\n..0..\n.1.1.\n0.1.0\n.1.1.\n0.0.0\n\nTuer2\nBlack brown\n.0.0.\n0.1.0\n.1.1.\n0.1.0\n.0.0.\n\nTuer_Offen\nyellow yellow\n.000.\n01110\n01110\n01110\n00000\n\n=======\nLEGEND\n=======\n\nPlayer = Player1 or player2\nCrate = Crate1 or Crate2\nWall = wall1 or wall2\ntuer = tuer1 or tuer2\n\n. = Background\n# = Wall1 and wall2\nP = Player1 and player2\n\n* = Crate1 and Crate2\n@ = Crate1 and crate2 and Target\nO = Target\n\nq = crate1\nw = crate2\n\nt = tuer1 and tuer2 and Tuer_Offen\n\ngewicht1 = player1 or Crate1 \ngewicht2 = player2 or Crate2\ngewicht = player or crate\n\n\n=======\nSOUNDS\n=======\n\nCrate1 MOVE 36772507\nCrate2 MOVE 36772507\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nTarget\nTarget_aktiviert\ntuer_offen\nplayer1, crate1, wall1, tuer1\nplayer2, crate2, wall2, tuer2\n\n======\nRULES\n======\n\n[player tuer] -> cancel\n\n==============\nWINCONDITIONS\n==============\n\n\n=======\nLEVELS\n=======\n\n#########\n#...t...#\n#.......#\n#.o...o.#\n#.......#\n#...q...#\n#.......#\n#...p...#\n#.......#\n#########\n\n(\n\nauszuprobieren\n\tteilweises Aufmachen\n 2 klötze\n)\n",["line 34 : Sprites must be 5 wide and 5 high.","line 29 : Sprite graphics must be 5 wide and 5 high exactly."]]
    ],
    [
        `No levels found`,
        ["title Simple Block Pushing Game\nauthor David Skinner\nhomepage www.puzzlescript.net\n\n========\nOBJECTS\n========\n\nBackground\nLIGHTGREEN GREEN\n11111\n01111\n11101\n11111\n10111\n\n\nTarget\nDarkBlue\n.....\n.000.\n.0.0.\n.000.\n.....\n\nWall\nBROWN DARKBROWN\n00010\n11111\n01000\n11111\n00010\n\nPlayer\nBlack Orange White Blue\n.000.\n.111.\n22222\n.333.\n.3.3.\n\nCrate\nOrange Yellow\n00000\n0...0\n0...0\n0...0\n00000\n\n\n=======\nLEGEND\n=======\n\n. = Background\n# = Wall\nP = Player\n* = Crate\n@ = Crate and Target\nO = Target\n\n\n=======\nSOUNDS\n=======\n\nCrate MOVE 36772507\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nTarget\nPlayer, Wall, Crate\n\n======\nRULES\n======\n\n[ > Player | Crate ] -> [ > Player | > Crate ]\n\n==============\nWINCONDITIONS\n==============\n\nAll Target on Crate\n\n=======\nLEVELS\n=======\n\n",["No levels found. Add some levels!"]]
    ],
    [
        `A rule has to have an arrow in it`,
        ["title Simple Block Pushing Game\nauthor David Skinner\nhomepage www.puzzlescript.net\n\n========\nOBJECTS\n========\n\nBackground\nLIGHTGREEN GREEN\n11111\n01111\n11101\n11111\n10111\n\n\nTarget\nDarkBlue\n.....\n.000.\n.0.0.\n.000.\n.....\n\nWall\nBROWN DARKBROWN\n00010\n11111\n01000\n11111\n00010\n\nPlayer\nBlack Orange White Blue\n.000.\n.111.\n22222\n.333.\n.3.3.\n\nCrate\nOrange Yellow\n00000\n0...0\n0...0\n0...0\n00000\n\n\n=======\nLEGEND\n=======\n\n. = Background\n# = Wall\nP = Player\n* = Crate\n@ = Crate and Target\nO = Target\n\n\n=======\nSOUNDS\n=======\n\nCrate MOVE 36772507\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nTarget\nPlayer, Wall, Crate\n\n======\nRULES\n======\n\n[ > Player | Crate ] [ > Player | > Crate ]\n\n==============\nWINCONDITIONS\n==============\n\nAll Target on Crate\n\n=======\nLEVELS\n=======\n\n\n####..\n#.O#..\n#..###\n#@P..#\n#..*.#\n#..###\n####..\n\n\n######\n#....#\n#.#P.#\n#.*@.#\n#.O@.#\n#....#\n######\n\n",["line 81 : A rule has to have an arrow in it. There's no arrow here! Consider reading up about rules - you're clearly doing something weird","line 81 : Error, when specifying a rule, the number of matches (square bracketed bits) on the left hand side of the arrow must equal the number on the right"]]
    ],
    [
        `each pattern to match on the left must have a corresponding pattern on the right of equal length`,
        ["title Block Faker\nauthor Droqen\nhomepage www.droqen.com\n\nrequire_player_movement\nkey_repeat_interval 0.12\n\nbackground_color white\ntext_color black\n\ncolor_palette c64\n(\nA port of first several levels of Droqen's beautiful game:\n\nhttps://droqen.itch.io/block-faker\n\n(his game has secrets that this one does not)\n\n)\n\n========\nOBJECTS\n========\n\nBackground\nWhite\n\nGrille\ngray\n0...0\n.0.0.\n..0..\n.0.0.\n0...0\n\nEndPoint\nGreen\n\nPlayer\nBlack\n00000\n00000\n0.0.0\n00000\n00000\n\nWall\nGray\n\nWallBlock\nBlack Grey\n01111\n01111\n01111\n01111\n00001\n\nBlueBlock\nBlue\n00000\n00.00\n0.0.0\n00.00\n00000\n\nGreenBlock\nLightGreen\n00000\n00000\n00.00\n00000\n00000\n\nPinkBlock\nRed\n00000\n00.00\n0...0\n00.00\n00000\n\nPurpleBlock\nPurple\n00000\n0...0\n0.0.0\n0...0\n00000\n\nOrangeBlock\nOrange\n00000\n0.0.0\n00000\n0.0.0\n00000\n\n\n=======\nLEGEND\n=======\n\nBlock = PinkBlock or BlueBlock or PurpleBlock or OrangeBlock or GreenBlock\nMoveable = Player or Block\nPlayerObstacle = Block or Wall or WallBlock\nBlockObstacle = Player or Wall or WallBlock or Grille or Block or EndPoint\n. = Background\n# = Wall\n@ = WallBlock\nP = Player\nB = BlueBlock\nG = GreenBLock\nK = PinkBlock\nR = PurpleBlock\nO = OrangeBlock\nE = EndPoint\nx = Grille\nH = Grille and Player\n\n\n=========\nSOUNDS\n=========\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nEndPoint\nGrille\nPlayer, Wall, WallBlock, PinkBlock, BlueBlock, PurpleBlock, OrangeBlock, GreenBlock\n\n======\nRULES\n======\n\n[ > Moveable | Moveable ] -> [ > Moveable | > Moveable ]\n\n[ > Block | | Grille ] -> [ Block | Grille ]\n\nlate [ PinkBlock | PinkBlock | PinkBlock ] -> [ | | ]\nlate [ BlueBlock | BlueBlock | BlueBlock ] -> [ | | ]\nlate [ PurpleBlock | PurpleBlock | PurpleBlock ] -> [ | | ]\nlate [ OrangeBlock | OrangeBlock | OrangeBlock ] -> [ | | ]\nlate [ GreenBlock | GreenBlock | GreenBlock ] -> [ | | ]\n\n==============\nWINCONDITIONS\n==============\nsome player on endpoint\n=======\nLEVELS\n=======\n\n........########\n################\n########@@@@@###\n####@@@@@...@###\n###@..OO....@@##\n##@..@@@@@....@#\n##@.@..@@@..E@@#\n#@..@.O...@@@@##\n##@...@.P.######\n####@.@@@@######\n####@@##########\n########........\n\nmessage congrats: level 2!\n\n##########\n####R.R###\n#x....#x##\n#xO#O.OxE#\n#xx##.#xx#\n#####R####\n#####P####\nO#########\n\nmessage congrats: level 3!\n\n......#######...\n.....##P.#####..\n....###....####.\n..#####O...#B..#\n..#####.#.##BB.#\n##EBB..O.O.....#\n..#####.#.#....#\n..######..#G.###\n....####..#.OOx.\n.....###.GG.#x..\n......#######...\n\nmessage congrats: level 4!\n\n######xx######\n######GG######\n##xx#...#xEx##\n##..O...#x..##\n##..#...##O###\n#..##.......##\nxG....##....Gx\nxG....##....Gx\n##.......GG###\n###G##...#xx##\n##x..#...O.x##\n##.P.#...#xx##\n######GG######\n######xx######\n\nmessage congrats: level 5!\n\n......##......\n....######....\n..##########..\n..#.OG..kk.#..\n.##OPO..Gkk##.\n.##GOG..GGk##.\n###...##...###\n###...##...###\n.##kkG##ROR##.\n.##Gkk..OEO##.\n..#.Gk..RO.#..\n..##########..\n....######....\n......##......\n\nmessage now go play the real game\n\n",["line 140 : In a rule, each pattern to match on the left must have a corresponding pattern on the right of equal length (number of cells)."]]
    ],
    [
        `An ellipsis on the left must be matched by one in the corresponding place on the right.`,
        ["title Block Faker\nauthor Droqen\nhomepage www.droqen.com\n\nrequire_player_movement\nkey_repeat_interval 0.12\n\nbackground_color white\ntext_color black\n\ncolor_palette c64\n(\nA port of first several levels of Droqen's beautiful game:\n\nhttps://droqen.itch.io/block-faker\n\n(his game has secrets that this one does not)\n\n)\n\n========\nOBJECTS\n========\n\nBackground\nWhite\n\nGrille\ngray\n0...0\n.0.0.\n..0..\n.0.0.\n0...0\n\nEndPoint\nGreen\n\nPlayer\nBlack\n00000\n00000\n0.0.0\n00000\n00000\n\nWall\nGray\n\nWallBlock\nBlack Grey\n01111\n01111\n01111\n01111\n00001\n\nBlueBlock\nBlue\n00000\n00.00\n0.0.0\n00.00\n00000\n\nGreenBlock\nLightGreen\n00000\n00000\n00.00\n00000\n00000\n\nPinkBlock\nRed\n00000\n00.00\n0...0\n00.00\n00000\n\nPurpleBlock\nPurple\n00000\n0...0\n0.0.0\n0...0\n00000\n\nOrangeBlock\nOrange\n00000\n0.0.0\n00000\n0.0.0\n00000\n\n\n=======\nLEGEND\n=======\n\nBlock = PinkBlock or BlueBlock or PurpleBlock or OrangeBlock or GreenBlock\nMoveable = Player or Block\nPlayerObstacle = Block or Wall or WallBlock\nBlockObstacle = Player or Wall or WallBlock or Grille or Block or EndPoint\n. = Background\n# = Wall\n@ = WallBlock\nP = Player\nB = BlueBlock\nG = GreenBLock\nK = PinkBlock\nR = PurpleBlock\nO = OrangeBlock\nE = EndPoint\nx = Grille\nH = Grille and Player\n\n\n=========\nSOUNDS\n=========\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nEndPoint\nGrille\nPlayer, Wall, WallBlock, PinkBlock, BlueBlock, PurpleBlock, OrangeBlock, GreenBlock\n\n======\nRULES\n======\n\n[ > Moveable | Moveable ] -> [ > Moveable | > Moveable ]\n\n[ > Block |... | Grille ] -> [ Block | | Grille ]\n\nlate [ PinkBlock | PinkBlock | PinkBlock ] -> [ | | ]\nlate [ BlueBlock | BlueBlock | BlueBlock ] -> [ | | ]\nlate [ PurpleBlock | PurpleBlock | PurpleBlock ] -> [ | | ]\nlate [ OrangeBlock | OrangeBlock | OrangeBlock ] -> [ | | ]\nlate [ GreenBlock | GreenBlock | GreenBlock ] -> [ | | ]\n\n==============\nWINCONDITIONS\n==============\nsome player on endpoint\n=======\nLEVELS\n=======\n\n........########\n################\n########@@@@@###\n####@@@@@...@###\n###@..OO....@@##\n##@..@@@@@....@#\n##@.@..@@@..E@@#\n#@..@.O...@@@@##\n##@...@.P.######\n####@.@@@@######\n####@@##########\n########........\n\nmessage congrats: level 2!\n\n##########\n####R.R###\n#x....#x##\n#xO#O.OxE#\n#xx##.#xx#\n#####R####\n#####P####\nO#########\n\nmessage congrats: level 3!\n\n......#######...\n.....##P.#####..\n....###....####.\n..#####O...#B..#\n..#####.#.##BB.#\n##EBB..O.O.....#\n..#####.#.#....#\n..######..#G.###\n....####..#.OOx.\n.....###.GG.#x..\n......#######...\n\nmessage congrats: level 4!\n\n######xx######\n######GG######\n##xx#...#xEx##\n##..O...#x..##\n##..#...##O###\n#..##.......##\nxG....##....Gx\nxG....##....Gx\n##.......GG###\n###G##...#xx##\n##x..#...O.x##\n##.P.#...#xx##\n######GG######\n######xx######\n\nmessage congrats: level 5!\n\n......##......\n....######....\n..##########..\n..#.OG..kk.#..\n.##OPO..Gkk##.\n.##GOG..GGk##.\n###...##...###\n###...##...###\n.##kkG##ROR##.\n.##Gkk..OEO##.\n..#.Gk..RO.#..\n..##########..\n....######....\n......##......\n\nmessage now go play the real game\n\n",["line 140 : An ellipsis on the left must be matched by one in the corresponding place on the right."]]
    ],
    [
        `You can't have anything in with an ellipsis. Sorry.`,
        ["title Block Faker\nauthor Droqen\nhomepage www.droqen.com\n\nrequire_player_movement\nkey_repeat_interval 0.12\n\nbackground_color white\ntext_color black\n\ncolor_palette c64\n(\nA port of first several levels of Droqen's beautiful game:\n\nhttps://droqen.itch.io/block-faker\n\n(his game has secrets that this one does not)\n\n)\n\n========\nOBJECTS\n========\n\nBackground\nWhite\n\nGrille\ngray\n0...0\n.0.0.\n..0..\n.0.0.\n0...0\n\nEndPoint\nGreen\n\nPlayer\nBlack\n00000\n00000\n0.0.0\n00000\n00000\n\nWall\nGray\n\nWallBlock\nBlack Grey\n01111\n01111\n01111\n01111\n00001\n\nBlueBlock\nBlue\n00000\n00.00\n0.0.0\n00.00\n00000\n\nGreenBlock\nLightGreen\n00000\n00000\n00.00\n00000\n00000\n\nPinkBlock\nRed\n00000\n00.00\n0...0\n00.00\n00000\n\nPurpleBlock\nPurple\n00000\n0...0\n0.0.0\n0...0\n00000\n\nOrangeBlock\nOrange\n00000\n0.0.0\n00000\n0.0.0\n00000\n\n\n=======\nLEGEND\n=======\n\nBlock = PinkBlock or BlueBlock or PurpleBlock or OrangeBlock or GreenBlock\nMoveable = Player or Block\nPlayerObstacle = Block or Wall or WallBlock\nBlockObstacle = Player or Wall or WallBlock or Grille or Block or EndPoint\n. = Background\n# = Wall\n@ = WallBlock\nP = Player\nB = BlueBlock\nG = GreenBLock\nK = PinkBlock\nR = PurpleBlock\nO = OrangeBlock\nE = EndPoint\nx = Grille\nH = Grille and Player\n\n\n=========\nSOUNDS\n=========\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nEndPoint\nGrille\nPlayer, Wall, WallBlock, PinkBlock, BlueBlock, PurpleBlock, OrangeBlock, GreenBlock\n\n======\nRULES\n======\n\n[ > Moveable | Moveable ] -> [ > Moveable | > Moveable ]\n\n[ > Block |... grille | Grille ] -> [ Block |... | Grille ]\n\nlate [ PinkBlock | PinkBlock | PinkBlock ] -> [ | | ]\nlate [ BlueBlock | BlueBlock | BlueBlock ] -> [ | | ]\nlate [ PurpleBlock | PurpleBlock | PurpleBlock ] -> [ | | ]\nlate [ OrangeBlock | OrangeBlock | OrangeBlock ] -> [ | | ]\nlate [ GreenBlock | GreenBlock | GreenBlock ] -> [ | | ]\n\n==============\nWINCONDITIONS\n==============\nsome player on endpoint\n=======\nLEVELS\n=======\n\n........########\n################\n########@@@@@###\n####@@@@@...@###\n###@..OO....@@##\n##@..@@@@@....@#\n##@.@..@@@..E@@#\n#@..@.O...@@@@##\n##@...@.P.######\n####@.@@@@######\n####@@##########\n########........\n\nmessage congrats: level 2!\n\n##########\n####R.R###\n#x....#x##\n#xO#O.OxE#\n#xx##.#xx#\n#####R####\n#####P####\nO#########\n\nmessage congrats: level 3!\n\n......#######...\n.....##P.#####..\n....###....####.\n..#####O...#B..#\n..#####.#.##BB.#\n##EBB..O.O.....#\n..#####.#.#....#\n..######..#G.###\n....####..#.OOx.\n.....###.GG.#x..\n......#######...\n\nmessage congrats: level 4!\n\n######xx######\n######GG######\n##xx#...#xEx##\n##..O...#x..##\n##..#...##O###\n#..##.......##\nxG....##....Gx\nxG....##....Gx\n##.......GG###\n###G##...#xx##\n##x..#...O.x##\n##.P.#...#xx##\n######GG######\n######xx######\n\nmessage congrats: level 5!\n\n......##......\n....######....\n..##########..\n..#.OG..kk.#..\n.##OPO..Gkk##.\n.##GOG..GGk##.\n###...##...###\n###...##...###\n.##kkG##ROR##.\n.##Gkk..OEO##.\n..#.Gk..RO.#..\n..##########..\n....######....\n......##......\n\nmessage now go play the real game\n\n",["line 140 : You can't have anything in with an ellipsis. Sorry."]]
    ],
    [
        `You can't use two ellipses in a single cell match pattern.`,
        ["title Block Faker\nauthor Droqen\nhomepage www.droqen.com\n\nrequire_player_movement\nkey_repeat_interval 0.12\n\nbackground_color white\ntext_color black\n\ncolor_palette c64\n(\nA port of first several levels of Droqen's beautiful game:\n\nhttps://droqen.itch.io/block-faker\n\n(his game has secrets that this one does not)\n\n)\n\n========\nOBJECTS\n========\n\nBackground\nWhite\n\nGrille\ngray\n0...0\n.0.0.\n..0..\n.0.0.\n0...0\n\nEndPoint\nGreen\n\nPlayer\nBlack\n00000\n00000\n0.0.0\n00000\n00000\n\nWall\nGray\n\nWallBlock\nBlack Grey\n01111\n01111\n01111\n01111\n00001\n\nBlueBlock\nBlue\n00000\n00.00\n0.0.0\n00.00\n00000\n\nGreenBlock\nLightGreen\n00000\n00000\n00.00\n00000\n00000\n\nPinkBlock\nRed\n00000\n00.00\n0...0\n00.00\n00000\n\nPurpleBlock\nPurple\n00000\n0...0\n0.0.0\n0...0\n00000\n\nOrangeBlock\nOrange\n00000\n0.0.0\n00000\n0.0.0\n00000\n\n\n=======\nLEGEND\n=======\n\nBlock = PinkBlock or BlueBlock or PurpleBlock or OrangeBlock or GreenBlock\nMoveable = Player or Block\nPlayerObstacle = Block or Wall or WallBlock\nBlockObstacle = Player or Wall or WallBlock or Grille or Block or EndPoint\n. = Background\n# = Wall\n@ = WallBlock\nP = Player\nB = BlueBlock\nG = GreenBLock\nK = PinkBlock\nR = PurpleBlock\nO = OrangeBlock\nE = EndPoint\nx = Grille\nH = Grille and Player\n\n\n=========\nSOUNDS\n=========\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nEndPoint\nGrille\nPlayer, Wall, WallBlock, PinkBlock, BlueBlock, PurpleBlock, OrangeBlock, GreenBlock\n\n======\nRULES\n======\n\n[ > Moveable | Moveable ] -> [ > Moveable | > Moveable ]\n\n[ > Block |... | grille | ... | Grille ] -> [ Block |...| grille | ... | Grille ]\n\nlate [ PinkBlock | PinkBlock | PinkBlock ] -> [ | | ]\nlate [ BlueBlock | BlueBlock | BlueBlock ] -> [ | | ]\nlate [ PurpleBlock | PurpleBlock | PurpleBlock ] -> [ | | ]\nlate [ OrangeBlock | OrangeBlock | OrangeBlock ] -> [ | | ]\nlate [ GreenBlock | GreenBlock | GreenBlock ] -> [ | | ]\n\n==============\nWINCONDITIONS\n==============\nsome player on endpoint\n=======\nLEVELS\n=======\n\n........########\n################\n########@@@@@###\n####@@@@@...@###\n###@..OO....@@##\n##@..@@@@@....@#\n##@.@..@@@..E@@#\n#@..@.O...@@@@##\n##@...@.P.######\n####@.@@@@######\n####@@##########\n########........\n\nmessage congrats: level 2!\n\n##########\n####R.R###\n#x....#x##\n#xO#O.OxE#\n#xx##.#xx#\n#####R####\n#####P####\nO#########\n\nmessage congrats: level 3!\n\n......#######...\n.....##P.#####..\n....###....####.\n..#####O...#B..#\n..#####.#.##BB.#\n##EBB..O.O.....#\n..#####.#.#....#\n..######..#G.###\n....####..#.OOx.\n.....###.GG.#x..\n......#######...\n\nmessage congrats: level 4!\n\n######xx######\n######GG######\n##xx#...#xEx##\n##..O...#x..##\n##..#...##O###\n#..##.......##\nxG....##....Gx\nxG....##....Gx\n##.......GG###\n###G##...#xx##\n##x..#...O.x##\n##.P.#...#xx##\n######GG######\n######xx######\n\nmessage congrats: level 5!\n\n......##......\n....######....\n..##########..\n..#.OG..kk.#..\n.##OPO..Gkk##.\n.##GOG..GGk##.\n###...##...###\n###...##...###\n.##kkG##ROR##.\n.##Gkk..OEO##.\n..#.Gk..RO.#..\n..##########..\n....######....\n......##......\n\nmessage now go play the real game\n\n",["line 140 : You can't use two ellipses in a single cell match pattern. If you really want to, please implement it yourself and send me a patch :)"]]
    ],
    [
        `You named an object "^", but this is a keyword. Don't do that!`,
        ["title Microban\nauthor David Skinner\nhomepage www.sneezingtiger.com/sokoban/levels/microbanText.html\n\n(\nMy favourite set of sokoban levels - here're the first ten of the Microban set.\n\nI tried contacting this guy, but he seems to have vanished from the net. The levels are in lots of places online, so I'm just chancing my arm by including them. BUT BE WARNED.\n)\n\n========\nOBJECTS\n========\n\nBackground\nLIGHTGREEN GREEN\n11111\n01111\n11101\n11111\n10111\n\n\nTarget\nDarkBlue\n.....\n.000.\n.0.0.\n.000.\n.....\n\nWall\nBROWN DARKBROWN\n00010\n11111\n01000\n11111\n00010\n\nPlayer\nBlack Orange White Blue\n.000.\n.111.\n22222\n.333.\n.3.3.\n\nCrate\nOrange Yellow\n00000\n0...0\n0...0\n0...0\n00000\n\n\n=======\nLEGEND\n=======\n\n. = Background\n# = Wall\nP = Player\n* = Crate\n@ = Crate and Target\nO = Target\n\n^ = Target\n\n=======\nSOUNDS\n=======\n\nCrate MOVE 36772507\nendlevel 83744503\nstartgame 92244503\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nTarget\nPlayer, Wall, Crate\n\n======\nRULES\n======\n\n[ > Player | Crate ] -> [ > Player | > Crate ]\n\n==============\nWINCONDITIONS\n==============\n\nAll Target on Crate\n\n=======\nLEVELS\n=======\n\nmessage level 1 of 10\n\n####..\n#.O#..\n#..###\n#@P..#\n#..*.#\n#..###\n####..\n\nmessage level 2 of 10\n\n######\n#....#\n#.#P.#\n#.*@.#\n#.O@.#\n#....#\n######\n\nmessage level 3 of 10\n\n..####...\n###..####\n#.....*.#\n#.#..#*.#\n#.O.O#P.#\n#########\n\nmessage level 4 of 10\n\n########\n#......#\n#.O@@*P#\n#......#\n#####..#\n....####\n\nmessage level 5 of 10\n\n.#######\n.#.....#\n.#.O*O.#\n##.*P*.#\n#..O*O.#\n#......#\n########\n\nmessage level 6 of 10\n\n######.#####\n#....###...#\n#.**.....#P#\n#.*.#OOO...#\n#...########\n#####.......\n\nmessage level 7 of 10\n\n#######\n#.....#\n#.O*O.#\n#.*O*.#\n#.O*O.#\n#.*O*.#\n#..P..#\n#######\n\nmessage level 8 of 10\n\n..######\n..#.OOP#\n..#.**.#\n..##.###\n...#.#..\n...#.#..\n####.#..\n#....##.\n#.#...#.\n#...#.#.\n###...#.\n..#####.\n\nmessage level 9 of 10\n\n#####.\n#O..##\n#P**.#\n##...#\n.##..#\n..##O#\n...###\n\nmessage level 10 of 10\n\n......#####\n......#O..#\n......#O#.#\n#######O#.#\n#.P.*.*.*.#\n#.#.#.#.###\n#.......#..\n#########..\n\nmessage congratulations!\n\n",["line 68 : You named an object \"^\", but this is a keyword. Don't do that!"]]
    ],
    [
        `incorrect sound declaration.`,
        ["title Microban\nauthor David Skinner\nhomepage www.sneezingtiger.com/sokoban/levels/microbanText.html\n\n(\nMy favourite set of sokoban levels - here're the first ten of the Microban set.\n\nI tried contacting this guy, but he seems to have vanished from the net. The levels are in lots of places online, so I'm just chancing my arm by including them. BUT BE WARNED.\n)\n\n========\nOBJECTS\n========\n\nBackground\nLIGHTGREEN GREEN\n11111\n01111\n11101\n11111\n10111\n\n\nTarget\nDarkBlue\n.....\n.000.\n.0.0.\n.000.\n.....\n\nWall\nBROWN DARKBROWN\n00010\n11111\n01000\n11111\n00010\n\nPlayer\nBlack Orange White Blue\n.000.\n.111.\n22222\n.333.\n.3.3.\n\nCrate\nOrange Yellow\n00000\n0...0\n0...0\n0...0\n00000\n\n\n=======\nLEGEND\n=======\n\n. = Background\n# = Wall\nP = Player\n* = Crate\n@ = Crate and Target\nO = Target \n\n\n=======\nSOUNDS\n=======\n\nCrate MOVE 36772507\nendlevel 83744503\nstartgame 92244503\nboop\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nTarget\nPlayer, Wall, Crate\n\n======\nRULES\n======\n\n[ > Player | Crate ] -> [ > Player | > Crate ]\n\n==============\nWINCONDITIONS\n==============\n\nAll Target on Crate\n\n=======\nLEVELS\n=======\n\nmessage level 1 of 10\n\n####..\n#.O#..\n#..###\n#@P..#\n#..*.#\n#..###\n####..\n\nmessage level 2 of 10\n\n######\n#....#\n#.#P.#\n#.*@.#\n#.O@.#\n#....#\n######\n\nmessage level 3 of 10\n\n..####...\n###..####\n#.....*.#\n#.#..#*.#\n#.O.O#P.#\n#########\n\nmessage level 4 of 10\n\n########\n#......#\n#.O@@*P#\n#......#\n#####..#\n....####\n\nmessage level 5 of 10\n\n.#######\n.#.....#\n.#.O*O.#\n##.*P*.#\n#..O*O.#\n#......#\n########\n\nmessage level 6 of 10\n\n######.#####\n#....###...#\n#.**.....#P#\n#.*.#OOO...#\n#...########\n#####.......\n\nmessage level 7 of 10\n\n#######\n#.....#\n#.O*O.#\n#.*O*.#\n#.O*O.#\n#.*O*.#\n#..P..#\n#######\n\nmessage level 8 of 10\n\n..######\n..#.OOP#\n..#.**.#\n..##.###\n...#.#..\n...#.#..\n####.#..\n#....##.\n#.#...#.\n#...#.#.\n###...#.\n..#####.\n\nmessage level 9 of 10\n\n#####.\n#O..##\n#P**.#\n##...#\n.##..#\n..##O#\n...###\n\nmessage level 10 of 10\n\n......#####\n......#O..#\n......#O#.#\n#######O#.#\n#.P.*.*.*.#\n#.#.#.#.###\n#.......#..\n#########..\n\nmessage congratulations!\n\n",["line 76 : unexpected sound token \"null\".","line 76 : incorrect sound declaration."]]
    ],
    [
        `Unrecognised stuff in the prelude`,
        ["title constellation z\nauthor increpare\nhomepage www.increpare.com\nasd \n(a port of the first few levels of my game, the full version of which is\nhttp://ded.increpare.com/~locus/constellationz/\n)\n\n========\nOBJECTS\n========\n\nBackground\nBlack\n\nBorderTile\nRed\n\nTeleport\nwhite\n\ntarget\nblue\n.....\n.000.\n.000.\n.000.\n.....\n\nPlayer\nPINK\n.....\n.000.\n.000.\n.000.\n.....\n\nAltPlayer\nBlack\n\n=======\nLEGEND\n=======\n\n# = BorderTile\n. = Background\nP = Player\nO = Teleport\nt = target\n\n\n=========\nSOUNDS\n=========\nsfx1 44641500 (teleport)\nstartgame 26858107\nstartlevel 34443107\nendlevel 34292905\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nTeleport,BorderTile, target\nPlayer, AltPlayer\n\n======\nRULES\n======\n\nlate [ player Teleport ] -> [ altplayer Teleport ] sfx1\n\nlate [ altplayer Teleport ] [ Teleport no altplayer ] -> [altplayer teleport] [Teleport player ]\nlate [altplayer ] -> []\n\nlate [ player bordertile ] -> cancel\n\n==============\nWINCONDITIONS\n==============\n\nsome player\nall player on target\nall target on player\n\n=======\nLEVELS\n=======\n\n##############\n#............#\n#............#\n#............#\n#............#\n#............#\n#............#\n#..P....t....#\n#............#\n#............#\n#............#\n#............#\n#............#\n##############\n\n##############\n#............#\n#............#\n#............#\n#............#\n#............#\n#............#\n#..P.o..O..t.#\n#............#\n#............#\n#............#\n#............#\n#............#\n##############\n\n##############\n#............#\n#............#\n#............#\n#............#\n#.......O.t..#\n#............#\n#..P....O....#\n#............#\n#.......O.t..#\n#............#\n#............#\n#............#\n##############\n\n##############\n#............#\n#............#\n#............#\n#............#\n#............#\n#............#\n#..P...O...t.#\n#............#\n#............#\n#............#\n#............#\n#............#\n##############\n\n\n##############\n#............#\n#............#\n#.......O.t..#\n#............#\n#.......O.t..#\n#............#\n#..P....O.t..#\n#............#\n#.......O.t..#\n#............#\n#.......O....#\n#............#\n##############\n\n###################################\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#..P.P.......OOOOOOOOO............#\n#................O........T.T.....#\n#..P.P.......O.O.O.O.O............#\n#.........................T.T.....#\n#............O.O.O.O.O............#\n#............O.......O............#\n#............OOOOOOOOO............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n###################################\n\n\n####################################\n#..................................#\n#...........p......................#\n#..................................#\n#.................o................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#............o....O....t.........t.#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n####################################\n\n\n####################################\n#..................................#\n#..................................#\n#....p.............................#\n#..................................#\n#..................................#\n#.......o....o....t....t....t......#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#.......o....o....t.........t......#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n####################################\n\n\n\n##############\n#............#\n#............#\n#............#\n#......o.....#\n#............#\n#......o.....#\n#............#\n#....o...o...#\n#............#\n#............#\n#............#\n#............#\n#......P.....#\n#............#\n#............#\n#....t...t...#\n#............#\n#....t.t.t...#\n#............#\n#....t...t...#\n#............#\n#............#\n#............#\n##############\n\n\n\n####################################\n#..................................#\n#..............tt...tt...tt........#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#.............o....o..o............#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#................pppp..............#\n#..................................#\n#..................................#\n####################################\n\n##############\n#............#\n#............#\n#............#\n#............#\n#............#\n#.p..........#\n#.p..........#\n#.p..........#\n#.p..........#\n#.p....o.....#\n#.p..........#\n#.p....o..t..#\n#.p..........#\n#.p..........#\n#.p....o.....#\n#.p..........#\n#.p..........#\n#.p..........#\n#.p..........#\n#............#\n#............#\n#............#\n#............#\n#............#\n##############\n\nmessage congratulations!\n\n",["line 4 : Unrecognised stuff in the prelude."]]
    ],
    [
        `Game title is too long to fit on screen, truncating to three lines.`,
        ["title constellation z asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf \nauthor increpare\nhomepage www.increpare.com\n\n(a port of the first few levels of my game, the full version of which is\nhttp://ded.increpare.com/~locus/constellationz/\n)\n\n========\nOBJECTS\n========\n\nBackground\nBlack\n\nBorderTile\nRed\n\nTeleport\nwhite\n\ntarget\nblue\n.....\n.000.\n.000.\n.000.\n.....\n\nPlayer\nPINK\n.....\n.000.\n.000.\n.000.\n.....\n\nAltPlayer\nBlack\n\n=======\nLEGEND\n=======\n\n# = BorderTile\n. = Background\nP = Player\nO = Teleport\nt = target\n\n\n=========\nSOUNDS\n=========\nsfx1 44641500 (teleport)\nstartgame 26858107\nstartlevel 34443107\nendlevel 34292905\n\n================\nCOLLISIONLAYERS\n================\n\nBackground\nTeleport,BorderTile, target\nPlayer, AltPlayer\n\n======\nRULES\n======\n\nlate [ player Teleport ] -> [ altplayer Teleport ] sfx1\n\nlate [ altplayer Teleport ] [ Teleport no altplayer ] -> [altplayer teleport] [Teleport player ]\nlate [altplayer ] -> []\n\nlate [ player bordertile ] -> cancel\n\n==============\nWINCONDITIONS\n==============\n\nsome player\nall player on target\nall target on player\n\n=======\nLEVELS\n=======\n\n##############\n#............#\n#............#\n#............#\n#............#\n#............#\n#............#\n#..P....t....#\n#............#\n#............#\n#............#\n#............#\n#............#\n##############\n\n##############\n#............#\n#............#\n#............#\n#............#\n#............#\n#............#\n#..P.o..O..t.#\n#............#\n#............#\n#............#\n#............#\n#............#\n##############\n\n##############\n#............#\n#............#\n#............#\n#............#\n#.......O.t..#\n#............#\n#..P....O....#\n#............#\n#.......O.t..#\n#............#\n#............#\n#............#\n##############\n\n##############\n#............#\n#............#\n#............#\n#............#\n#............#\n#............#\n#..P...O...t.#\n#............#\n#............#\n#............#\n#............#\n#............#\n##############\n\n\n##############\n#............#\n#............#\n#.......O.t..#\n#............#\n#.......O.t..#\n#............#\n#..P....O.t..#\n#............#\n#.......O.t..#\n#............#\n#.......O....#\n#............#\n##############\n\n###################################\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#..P.P.......OOOOOOOOO............#\n#................O........T.T.....#\n#..P.P.......O.O.O.O.O............#\n#.........................T.T.....#\n#............O.O.O.O.O............#\n#............O.......O............#\n#............OOOOOOOOO............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n#............O...O...O............#\n###################################\n\n\n####################################\n#..................................#\n#...........p......................#\n#..................................#\n#.................o................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#............o....O....t.........t.#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n####################################\n\n\n####################################\n#..................................#\n#..................................#\n#....p.............................#\n#..................................#\n#..................................#\n#.......o....o....t....t....t......#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#.......o....o....t.........t......#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n####################################\n\n\n\n##############\n#............#\n#............#\n#............#\n#......o.....#\n#............#\n#......o.....#\n#............#\n#....o...o...#\n#............#\n#............#\n#............#\n#............#\n#......P.....#\n#............#\n#............#\n#....t...t...#\n#............#\n#....t.t.t...#\n#............#\n#....t...t...#\n#............#\n#............#\n#............#\n##############\n\n\n\n####################################\n#..................................#\n#..............tt...tt...tt........#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#.............o....o..o............#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#..................................#\n#................pppp..............#\n#..................................#\n#..................................#\n####################################\n\n##############\n#............#\n#............#\n#............#\n#............#\n#............#\n#.p..........#\n#.p..........#\n#.p..........#\n#.p..........#\n#.p....o.....#\n#.p..........#\n#.p....o..t..#\n#.p..........#\n#.p..........#\n#.p....o.....#\n#.p..........#\n#.p..........#\n#.p..........#\n#.p..........#\n#............#\n#............#\n#............#\n#............#\n#............#\n##############\n\nmessage congratulations!\n\n",["Game title is too long to fit on screen, truncating to three lines."]]
    ]
];