// http://game.yatrack.cn/

/**
 * 队列
 */
var CQueue = new Class({
  // 构造函数
  initialize: function() {
    this.m_buffer = [];
    this.m_startIndex = 0;
    this.m_endIndex = 0;
  },

  // 将对象添加到队列的结尾处
  // 不能添加null或undefined
  enqueue: function(enqueueValue) {
    // 队列中不能加入null值
    if (!$defined(enqueueValue)) {
      return;
    }

    this.m_buffer[this.m_endIndex] = enqueueValue;

    this.m_endIndex++;
  },

  // 移除并返回队列开始处的对象
  dequeue: function() {
    // 如果队列为空，则返回null
    if (this.m_startIndex == this.m_endIndex) {
      return null;
    }

    var dequeueValue = this.m_buffer[this.m_startIndex];

    this.m_buffer[this.m_startIndex] = null;

    this.m_startIndex++;

    return dequeueValue;
  },

  // 清空队列
  clear: function() {
    this.buffer = [];
    this.m_startIndex = 0;
    this.m_endIndex = 0;
  },

  // 返回队列开头处的对象，但不删除
  peek: function() {
    // 如果队列为空，则返回null
    if (this.m_startIndex == this.m_endIndex) {
      return null;
    }

    return this.m_buffer[this.m_startIndex];
  },

  // 队列中对象的个数
  getLength: function() {
    return this.m_endIndex - this.m_startIndex;
  },

  // 队列中是否包含对象
  contains: function(testValue) {
    for (var i = this.m_startIndex; i < this.m_endIndex; i++) {
      if (this.m_buffer[i] == testValue) {
        return true;
      }
    }
    return false;
  },

  empty: function() {

  }
});

/**
 * 快速字符串构造器
 */
var CStringBuilder = new Class({
  // 构造函数
  initialize: function(initialValue) {
    this.buffer = [];
    this.bufferLength = 0;

    if (initialValue != null) {
      this.append(initialValue);
    }
  },

  // 连接一个新字符串
  append: function(appendValue) {
    if (appendValue == null) {
      return;
    }

    this.bufferLength += appendValue.length;

    this.buffer.push(appendValue);
  },

  // 清空字符串
  clear: function() {
    this.buffer = [];
    this.bufferLength = 0;
  },

  // 字符串长度
  length: function() {
    return this.bufferLength;
  },

  // 返回完整的字符串
  toString: function() {
    return this.buffer.join("");
  },

  empty: function() {
  }
});
/**
 * 记录类，可以在Firefox的FireBug插件中查看
 */
var Logger = new(new Class({
  // 构造函数
  initialize: function() {

    this.m_startTime = new Date();

    this.log("start.");
  },

  // 记录一条消息
  log: function(msg) {
    var now = new Date();
    // 本次距离上次log的时间间隔
    var elapsedTime = (now - this.m_startTime) / 1000;
    this.m_startTime = now;

    if (window.console && console.log) {
      console.log(elapsedTime + "\t" + msg);
    } else {
      //$("logResult2").innerHTML += msgType + "\t" + elapsedTime + "\t" + msg + "<br/>";
    }
  }
}))();

/**
 * 游戏基类
 */
var CGame = new Class({
  // 构造函数
  initialize: function() {
    // private,游戏状态（1：游戏终止 2：游戏进行中 3：游戏暂停 ）
    this.m_gameStatus = 1;
    // private,游戏的上一个状态
    this.m_lastGameStatus = 0;
    // 毫秒定时器
    this.m_interval = null;
    // 定时器调用间隔（毫秒）
    this.m_intervalMilliseconds = 100;
    // 逝去的时间（毫秒）
    this.m_elapsedMilliseconds = 0;
    // 单元格前缀
    this.m_cellPrefix = 'gameCell_';
    // 二维矩阵
    this.m_matrix = [];
    // 缓存的图片(在每个游戏中填充)
    this.m_imageCaches = [];

    window.addEvent('domready', this.g_onWindowLoad.bind(this));
  },

  //////页面事件处理///////////////////////////////////////////////////////////
  // 载入全部网页资源后执行
  g_onWindowLoad: function() {
    $('start').addEvent('click', this.g_onStartClick.bindWithEvent(this));
    $('stop').addEvent('click', this.g_onStopClick.bindWithEvent(this));
    $('pause').addEvent('click', this.g_onPauseClick.bindWithEvent(this));
    $('level').addEvent('change', this.g_onLevelChange.bindWithEvent(this));
    // 鼠标右键
    // document.addEvent('contextmenu', this.g_onDocumentContextmenu.bindWithEvent(this));
    // 键盘
    document.addEvent('keydown', this.g_onDocumentKeydown.bindWithEvent(this));

    // 点击在线游戏
    /*
    if($defined($('aOnlineGame')))
    {
        $('aOnlineGame').addEvent('click', this._onOnlineGameClick.bindWithEvent(this));
    }

    // 初始化提示框
    this._initTooltips();
    */
    this._onWindowLoad();
  },

  // 点击在线游戏
  /*
  _onOnlineGameClick: function(evt)
  {
      evt.stop();

      // 随机导航到一个游戏
      window.location.href = $('ulGameList').getChildren().getRandom().getChildren()[0].href;
  },


  // 初始化提示框
  _initTooltips: function()
  {

      var tooltip = new Tips($$('.tooltip'),{
          initialize:function(){
              this.fx = new Fx.Style(this.toolTip, 'opacity', {duration: 500, wait: false}).set(0);
          },
          onShow: function(toolTip) {
              this.fx.start(1);
          },
          onHide: function(toolTip) {
              this.fx.start(0);
          }
      });
  },
   */
  // 键盘
  g_onDocumentKeydown: function(evt) {
    evt.stop();

    switch (evt.key) {
      case 'enter':
        if (this.g_getGameStatus() != GameStatus.Start) {
          this.g_startGame();
        } else {
          this.g_pauseGame();
        }
        break;
      case 'esc':
        this.g_stopGame();
        break;
    }

    this._onDocumentKeydown(evt.key);
  },

  // 鼠标右键
  g_onDocumentContextmenu: function(evt) {
    evt.stop();

    if (this.g_getGameStatus() == GameStatus.Start) {
      this._onDocumentContextmenu(evt);
    }
  },

  // 设置当前的游戏状态(GameStatus.Start/GameStatus.Stop/GameStatus.Pause)，不能直接对m_gameStatus赋值
  g_setGameStatus: function(status) {
    this.m_lastGameStatus = this.m_gameStatus;

    this.m_gameStatus = status;
  },

  // 取得当前游戏状态
  g_getGameStatus: function() {
    return this.m_gameStatus;
  },

  // 点击开始按钮
  g_onStartClick: function(e) {
    e.stop();
    $('start').blur();

    // 如果游戏没有终止，点击开始没反应
    if (this.m_gameStatus == GameStatus.Start || this.m_gameStatus == GameStatus.Pause) {
      return;
    }

    this.g_startGame();
  },

  // 开始游戏
  g_startGame: function() {
    // 当前游戏状态不是开始，就启动游戏
    if (this.m_gameStatus != GameStatus.Start) {
      this.g_setGameStatus(GameStatus.Start);
      this.g_resetGameStatus();
    }
  },

  // 点击终止按钮
  g_onStopClick: function(e) {
    e.stop();
    $('stop').blur();

    //if(!confirm("确定要退出游戏？"))return;

    this.g_stopGame();
  },

  // 终止游戏
  g_stopGame: function() {
    // 如果还没有启动游戏，点击终止不响应
    if (this.m_gameStatus == GameStatus.Stop) {
      return;
    }

    if (this.m_gameStatus != GameStatus.Stop) {
      this.g_setGameStatus(GameStatus.Stop);
      this.g_resetGameStatus();
    }
  },

  // 点击暂停按钮
  g_onPauseClick: function(e) {
    e.stop();
    $('pause').blur();

    // 如果还没有启动游戏，点击暂停不响应
    if (this.m_gameStatus == GameStatus.Stop) {
      return;
    }

    // 如果上次状态是 暂停，则再次点击为继续
    if (this.m_gameStatus == GameStatus.Pause) {
      this.g_startGame();
    } else if (this.m_gameStatus == GameStatus.Start) {
      this.g_pauseGame();
    }
  },

  // 暂停游戏
  g_pauseGame: function() {
    if (this.m_gameStatus != GameStatus.Pause) {
      this.g_setGameStatus(GameStatus.Pause);
      this.g_resetGameStatus();
    }
  },

  // 更改游戏级别
  g_onLevelChange: function() {
    $('level').blur();
    //document.focus();

    //this._onLevelChange(parseInt($('level').value, 10));
    this._onLevelChange($('level').value.toInt());
  },

  // 根据m_gameStatus设置页面元素
  g_resetGameStatus: function() {
    if (this.m_gameStatus == GameStatus.Stop) {
      // 终止游戏
      this.g_disableStatus();
      this.g_enableSetting();

      $('start').removeClass('disabled');
      $('start').addClass('positive');

      $('pause').addClass('disabled');

      $('stop').removeClass('negative');
      $('stop').addClass('disabled');
      //$('pause').disabled = true;
      //$('stop').disabled = true;
      //$('start').disabled = false;

      this.g_stopTimeInterval();

      this.g_setElapsedTime('-');
    } else if (this.m_gameStatus == GameStatus.Start) {
      // 启动游戏
      this.g_enableStatus();
      this.g_disableSetting();

      $('start').removeClass('positive');
      $('start').addClass('disabled');

      $('pause').removeClass('disabled');

      $('stop').removeClass('disabled');
      $('stop').addClass('negative');
      //$('pause').disabled = false;
      //$('stop').disabled = false;
      //$('start').disabled = true;

      // 如果上次游戏状态不是暂停，则重置ElapsedTime
      if (this.m_lastGameStatus == GameStatus.Pause) {
        $('pause').innerHTML = "暂停游戏";
      } else {
        this.g_setElapsedTime(0);
      }

      this.g_startTimeInterval();
    } else if (this.m_gameStatus == GameStatus.Pause) {
      // 暂停游戏
      this.g_enableStatus();
      this.g_disableSetting();

      $('start').removeClass('positive');
      $('start').addClass('disabled');

      $('pause').removeClass('disabled');

      //$('pause').disabled = false;
      //$('start').disabled = true;

      if (this.m_lastGameStatus == GameStatus.Start) {
        $('pause').innerHTML = "继续游戏";
      }

      this.g_pauseTimeInterval();
    }

    this._resetGameStatus(this.m_gameStatus, this.m_lastGameStatus);
  },
  ///////////////////////////////////////////////////////////////////////

  //////定时调度///////////////////////////////////////////////////////////
  // 开始定时(100毫秒调度一次)
  g_startTimeInterval: function() {
    //this.m_interval = window.setInterval(this.g_onTimeInterval.bind(this), this.m_intervalMilliseconds);

    this.m_interval = this.g_onTimeInterval.periodical(this.m_intervalMilliseconds, this);
  },

  // 终止定时
  g_stopTimeInterval: function() {
    this.m_elapsedMilliseconds = 0;
    //window.clearInterval(this.m_interval);
    $clear(this.m_interval);
  },

  // 暂停定时
  g_pauseTimeInterval: function() {
    //window.clearInterval(this.m_interval);
    $clear(this.m_interval);
  },

  // 定时调度函数
  g_onTimeInterval: function() {
    this.m_elapsedMilliseconds += this.m_intervalMilliseconds;
    if (this.m_elapsedMilliseconds % 1000 == 0) {
      this.g_setElapsedTime(this.m_elapsedMilliseconds / 1000);
    }

    this._onTimeInterval(this.m_intervalMilliseconds);
  },
  /////////////////////////////////////////////////////////////////////////

  //////设置页面元素///////////////////////////////////////////////////////////
  // 设置游戏逝去的时间
  g_setElapsedTime: function(elapsedSeconds) {
    $('elapsedTime').innerHTML = this._formatSeconds(elapsedSeconds);
  },

  // 返回秒的字符串表示
  _formatSeconds: function(seconds) {
    // 两种特殊情况
    if (seconds == '-') {
      return '-';
    }
    if (seconds == 0) {
      return "0秒";
    }

    var rtStr = "";
    if (seconds >= 3600) {
      var hours = Math.floor(seconds / 3600);
      seconds = seconds - hours * 3600;

      rtStr += hours + "时";
    }
    if (seconds >= 60) {
      var minutes = Math.floor(seconds / 60);
      seconds = seconds - minutes * 60;

      rtStr += minutes + "分";
    }
    if (seconds != 0) {
      rtStr += seconds + "秒";
    }

    return rtStr;
  },

  // 设置状态不变灰
  g_enableStatus: function() {
    $('leftzhuangtai').removeClass('gray');
  },

  // 设置状态变灰
  g_disableStatus: function() {
    $('leftzhuangtai').addClass('gray');
  },

  // 设置所有的设置不可用
  g_enableSetting: function() {
    var eles = $('leftshezhi').getChildren();

    eles.each(function(ele, index) {
      ele.disabled = false;
    });
  },

  // 设置所有的设置不可用
  g_disableSetting: function() {
    var eles = $('leftshezhi').getChildren();

    eles.each(function(ele, index) {
      ele.disabled = true;
    });
  },

  // 折叠、展开元素
  g_openclose: function(eleId) {
    //$(eleId).toggle();
  },
  /////////////////////////////////////////////////////////////////////

  //////虚方法///////////////////////////////////////////////////////////////
  // [virtual] 重置游戏状态
  _resetGameStatus: function(gameStatus, lastGameStatus) {
  },

  // [virtual] 定时调用
  _onTimeInterval: function(elasedSeconds) {
  },

  // [virtual] 页面加载后调用
  _onWindowLoad: function() {
  },

  // [virtual] 点击鼠标右键
  _onDocumentContextmenu: function(evt) {
  },

  // [virtual] 键盘
  _onDocumentKeydown: function(key) {
  },
  /////////////////////////////////////////////////////////////////////////////

  //////GameTable的辅助方法/////////////////////////////////////////////////////
  // 由单元格ID取得此单元格的row/column，返回数组
  // 单元格ID的格式：this.m_cellPrefix + row + '_' + column
  g_getRowColumnByCellId: function(cellId) {
    var rowColumn = [];

    var tmpStr = cellId.substr(this.m_cellPrefix.length);
    var tmpLastUnderlineIndex = tmpStr.lastIndexOf('_');

    // 取得当前点击的单元格的row/column
    //rowColumn[0] = parseInt(tmpStr.substr(0, tmpLastUnderlineIndex));
    //rowColumn[1] = parseInt(tmpStr.substr(tmpLastUnderlineIndex + 1));
    rowColumn[0] = tmpStr.substr(0, tmpLastUnderlineIndex).toInt();
    rowColumn[1] = tmpStr.substr(tmpLastUnderlineIndex + 1).toInt();

    return rowColumn;
  },

  // 取得单元格Id
  g_getCellId: function(row, column) {
    return this.m_cellPrefix + row + '_' + column;
  },

  // 取得单元格节点
  g_getCellNode: function(row, column) {
    return $(this.g_getCellId(row, column));
  },

  /////m_matrix相关方法////////////////////////////////////////////////////////////////////
  // 初始化this.m_matrix的每一项为null
  g_initMatrix: function(value) {
    /*
    if(Util.isEmpty(value))
    {
        value = null;
    }*/
    if (!$defined(value)) {
      value = null;
    }

    this.m_matrix = [];
    for (var i = 0; i < this.m_rowCount; i++) {
      this.m_matrix[i] = [];
      for (var j = 0; j < this.m_columnCount; j++) {
        this.m_matrix[i][j] = value;
      }
    }
  },

  // 将this.m_matrix中为null或undefined的空格填充为value值
  g_initMatrixNullCell: function(value) {
    for (var i = 0; i < this.m_rowCount; i++) {
      for (var j = 0; j < this.m_columnCount; j++) {
        if (!$defined(this.m_matrix[i][j])) {
          this.m_matrix[i][j] = value;
        }
      }
    }
  },

  // 取得this.m_matrix中一个随机的空位置
  g_getMatrixRandomNullCell: function() {
    var row = $random(0, this.m_rowCount - 1);
    var column = $random(0, this.m_columnCount - 1);

    for (; row < this.m_rowCount; row++) {
      for (; column < this.m_columnCount; column++) {
        var currentAnimalId = this.m_matrix[row][column];
        if (!$defined(currentAnimalId)) {
          return [row, column];
        }
      }
    }

    // 如果随机点之后没有找到空位置，则从头开始找
    for (row = 0; row < this.m_rowCount; row++) {
      for (column = 0; column < this.m_columnCount; column++) {
        var currentAnimalId = this.m_matrix[row][column];
        if (!$defined(currentAnimalId)) {
          return [row, column];
        }
      }
    }
    return null;
  },

  // 将一个value添加到matrix中的一个随机位置
  // 必须保证 this.m_matrix[0] = [] ，还没有赋值
  g_insertMatrixRandomNullCell: function(value) {
    var rowColumn = this.g_getMatrixRandomNullCell();
    if (rowColumn !== null) {
      this.m_matrix[rowColumn[0]][rowColumn[1]] = value;
    }
  },
  // 而是点[row, column]是否在矩阵的外面
  g_testPositionOut: function(testRow, testColumn) {
    if (testRow < 0 || testRow >= this.m_rowCount || testColumn < 0 || testColumn >= this.m_columnCount) {
      return true;
    }
    return false;
  },

  // 检查value是否在 this.m_matrix中存在
  g_testValueExist: function(value) {
    for (var i = 0; i < this.m_rowCount; i++) {
      for (var j = 0; j < this.m_columnCount; j++) {
        if (this.m_matrix[i][j] && this.m_matrix[i][j] == value) {
          return true;
        }
      }
    }
    return false;
  },
  ///////////////////////////////////////////////////////////////////////////

  ///////Direction////////////////////////////////////////////////////////////
  // 随机一个方向
  g_getRandomDirection: function() {
    var rtDirection = Direction.Left;

    var randomValue = $random(0, 3);
    switch (randomValue) {
      case 0:
        rtDirection = Direction.Left;
        break;
      case 1:
        rtDirection = Direction.Up;
        break;
      case 2:
        rtDirection = Direction.Right;
        break;
      case 3:
        rtDirection = Direction.Down;
        break;
    }
    return rtDirection;
  },
  // 按照顺时针方向返回下一个方向
  g_getNextDirection: function(direction) {
    var rtDirection = Direction.Left;
    switch (direction) {
      case Direction.Down:
        rtDirection = Direction.Left;
        break;
      case Direction.Left:
        rtDirection = Direction.Up;
        break;
      case Direction.Up:
        rtDirection = Direction.Right;
        break;
      case Direction.Right:
        rtDirection = Direction.Down;
        break;
    }
    return rtDirection;
  },
  ///////////////////////////////////////////////////////////////////////////

  g_gameover: function(msg) {
    alert(msg);
    this.g_stopGame();
  },

  empty: function() {
  }
});

// [枚举]游戏的状态
var GameStatus = {
  Stop: 1,
  Start: 2,
  Pause: 3
};
// [枚举]游戏级别
var GameLevel = {
  Hello: 1,
  Easy: 2,
  Middle: 3,
  Hard: 4,
  Expert: 5
};
// [枚举]方向(使用键盘的上下左右的值)
var Direction = {
  Left: 1,
  Up: 2,
  Right: 3,
  Down: 4
};
// [枚举]按键值
//var KeyCode =  {Left:37, Up:38, Right:39, Down:40, Enter:13, Space:32, Esc:27, Q:81, W:87, A:65, S:83};

/**
 * 贪吃蛇
 */
var CSnake = CGame.extend({
  // 构造函数
  initialize: function() {
    // 调用CGame的initialize方法
    this.parent();
  },

  // [required]载入全部网页资源后执行
  _onWindowLoad: function() {
    /////游戏参数，根据游戏级别设置///////////////////////////////////////////////////////
    // 行数
    this.m_rowCount = 12;
    // 列数
    this.m_columnCount = 12;
    // 单元格总个数
    this.m_cellCount = this.m_rowCount * this.m_columnCount;
    // 点击次数
    this.m_eatCount = 0;
    ////////////////////////////////////////////////////////////
    // 移动的时间间隔(毫秒)
    this.m_moveInterval = 0;
    // 逝去的时间(毫秒)
    this.m_elapsedMoveInterval = 0;
    // 食物的位置
    this.m_foodRow = 0;
    this.m_foodColumn = 0;
    // 贪吃蛇数据，数组中每个元素是[row, column]的数组，第一个元素是蛇尾
    this.m_snake = [];
    // 贪吃蛇的长度(长度不会减少)
    //this.m_snakeLength = 0;
    // 蛇行进方向
    this.m_snakeDirection = Direction.Down;
    //this.m_snakeLastDirection = Direction.Down;

    this._initGameLevel();

  },

  // [required]两个参数:当前游戏状态、上次游戏状态（GameStatus）
  _resetGameStatus: function(gameStatus, lastGameStatus) {
    if (gameStatus == GameStatus.Stop) {
      // 终止游戏
      $('eatCount').innerHTML = "-";

      this._initGameLevel();
    } else if (gameStatus == GameStatus.Start) {
      // 启动游戏
      if (lastGameStatus != GameStatus.Pause) {
        $('eatCount').innerHTML = "0个";
      }

    } else if (gameStatus == GameStatus.Pause) {
      // 暂停游戏
    }
  },

  // [required]一个参数：定时器调用间隔
  _onTimeInterval: function(intervalMilliseconds) {
    if (this.g_getGameStatus() == GameStatus.Start) {
      this.m_elapsedMoveInterval += intervalMilliseconds;

      if (this.m_elapsedMoveInterval >= this.m_moveInterval) {
        this.m_elapsedMoveInterval = 0;
        // move
        this._moveBlockDirection();
      }
    }
  },

  // [required]一个参数：游戏级别（GameLevel）
  _onLevelChange: function(gameLevel) {
    this._initGameLevel(gameLevel);
  },

  // [required]点击鼠标右键，只有在游戏进行中才会调用此函数
  _onDocumentContextmenu: function(evt) {

  },

  // [required]一个参数：按下的键值（key）
  _onDocumentKeydown: function(key) {
    switch (key) {
      case 'down':
        // down
        // 开始游戏
        this.g_startGame();
        if (this.m_snake.length == 1 || (this.m_snake.length != 1 && this.m_snakeDirection != Direction.Up)) {
          this.m_snakeDirection = Direction.Down;
        }
        break;
      case 'up':
        // up
        this.g_startGame();
        if (this.m_snake.length == 1 || (this.m_snake.length != 1 && this.m_snakeDirection != Direction.Down)) {
          this.m_snakeDirection = Direction.Up;
        }
        break;
      case 'left':
        // left
        this.g_startGame();
        if (this.m_snake.length == 1 || (this.m_snake.length != 1 && this.m_snakeDirection != Direction.Right)) {
          this.m_snakeDirection = Direction.Left;
        }
        break;
      case 'right':
        // right
        this.g_startGame();
        if (this.m_snake.length == 1 || (this.m_snake.length != 1 && this.m_snakeDirection != Direction.Left)) {
          this.m_snakeDirection = Direction.Right;
        }
        break;
    }
  },

  // 根据游戏级别初始化游戏面板
  _initGameLevel: function(gameLevel) {
    if (!gameLevel) {
      gameLevel = $('level').value.toInt();
    } else {
      // 保持级别下拉列表和参数的一致
      $('level').value = gameLevel;
    }

    switch (gameLevel) {
      case GameLevel.Hello:
        this.m_moveInterval = 500;
        break;
      case GameLevel.Easy:
        this.m_moveInterval = 400;
        break;
      case GameLevel.Middle:
        this.m_moveInterval = 300;
        break;
      case GameLevel.Hard:
        this.m_moveInterval = 200;
        break;
      case GameLevel.Expert:
        this.m_moveInterval = 100;
        break;
    }
    this.m_elapsedMoveInterval = 0;
    this.m_foodRow = 0;
    this.m_foodColumn = 0;
    this.m_snake = [];
    //this.m_snakeLength = 0;
    this.m_snakeDirection = Direction.Down;
    // 吃掉食物数
    this.m_eatCount = 0;

    // 创建游戏面板
    this._initGamePanel();

    // 初始化贪吃蛇的位置
    this._initSnake();

    // 创建一个食物
    this._createAFood();
  },

  // 初始化贪吃蛇的位置
  _initSnake: function() {
    this.m_snake[0] = [];
    this.m_snake[0][0] = $random(0, this.m_rowCount - 1);
    this.m_snake[0][1] = $random(0, this.m_columnCount - 1);
    /*
    this.m_snake[1] = [];
    if(this.m_snake[0][0] + 1 < this.m_rowCount)
    {
        this.m_snake[1][0] = this.m_snake[0][0] + 1;
        this.m_snake[1][1] = this.m_snake[0][1];
    }
    else if(this.m_snake[0][1] + 1 < this.m_columnCount)
    {
        this.m_snake[1][0] = this.m_snake[0][0];
        this.m_snake[1][1] = this.m_snake[0][1] + 1;
    }
    else
    {
        this._initSnake();
        return;
    }
    */

    this.g_getCellNode(this.m_snake[0][0], this.m_snake[0][1]).addClass('snake');
    //$(this.g_getCellId(this.m_snake[1][0], this.m_snake[1][1])).addClassName('snake');
  },

  // 创建一个食物
  _createAFood: function() {
    this.m_foodRow = $random(0, this.m_rowCount - 1);
    this.m_foodColumn = $random(0, this.m_columnCount - 1);

    if (this._isHitWithSnake(this.m_foodRow, this.m_foodColumn)) {
      this._createAFood();
      return;
    }

    this.g_getCellNode(this.m_foodRow, this.m_foodColumn).addClass('food');
  },

  // 点[row, column]是否和贪吃蛇发生碰撞
  _isHitWithSnake: function(row, column) {
    var snakeLength = this.m_snake.length;
    for (var i = 0; i < snakeLength; i++) {
      if (this.m_snake[i][0] == row && this.m_snake[i][1] == column) {
        return true;
      }
    }
    return false;
  },

  // 创建游戏面板
  _initGamePanel: function() {
    var reval = new CStringBuilder();
    reval.append('<table id="gameTable" cellspacing="0" cellpadding="0" border="0"');
    for (var i = 0; i < this.m_rowCount; i++) {
      reval.append('<tr>');
      for (var j = 0; j < this.m_columnCount; j++) {
        reval.append('<td id="' + this.g_getCellId(i, j) + '"> </td>');
      }
      reval.append('</tr>');
    }
    reval.append('</table>');

    $('main').innerHTML = reval.toString();

    $('gameTable').addEvent('click', this._onGameTableClick.bindWithEvent(this));
    $('gameTable').addEvent('selectstart', this._onGameTableSelectstart.bindWithEvent(this));
  },

  // 防止IE下按着鼠标左键拖动时选中单元格的内容
  _onGameTableSelectstart: function(evt) {
    evt.stop();
  },

  // 点击表格
  _onGameTableClick: function(evt) {
    var target = $(evt.target);
    // 首先判断是单元格，而不是边框
    if (target.id.indexOf(this.m_cellPrefix) >= 0) {
      // 点击即开始游戏
      if (this.g_getGameStatus() != GameStatus.Start) {
        this.g_startGame();
        return;
      }
    }
  },

  // 移动方块
  _moveBlock: function(offsetRow, offsetColumn) {
    var snakeLength = this.m_snake.length;

    // 测试的方块
    var testRow = this.m_snake[snakeLength - 1][0] + offsetRow;
    var testColumn = this.m_snake[snakeLength - 1][1] + offsetColumn;
    // 穿墙之术
    if (testRow < 0) {
      testRow = this.m_rowCount - 1;
    } else if (testRow >= this.m_rowCount) {
      testRow = 0;
    }
    if (testColumn < 0) {
      testColumn = this.m_columnCount - 1;
    } else if (testColumn >= this.m_columnCount) {
      testColumn = 0;
    }

    // 不能后退
    if (this._isHitWithSnake(testRow, testColumn)) {
      this.g_pauseGame();
      alert("游戏结束。");
      this.g_stopGame();
      return;
    }

    // 如果和食物相撞，吃了它
    if (testRow == this.m_foodRow && testColumn == this.m_foodColumn) {
      this.m_eatCount++;
      $('eatCount').innerHTML = this.m_eatCount + "个";

      this.m_snake[snakeLength] = [];
      this.m_snake[snakeLength][0] = this.m_foodRow;
      this.m_snake[snakeLength][1] = this.m_foodColumn;

      this.g_getCellNode(this.m_foodRow, this.m_foodColumn).removeClass('food');
      this.g_getCellNode(this.m_foodRow, this.m_foodColumn).addClass('snake');

      this._createAFood();
    } else {
      // 设置蛇参数和页面显示
      this.g_getCellNode(this.m_snake[0][0], this.m_snake[0][1]).removeClass('snake');
      for (var i = 0; i < snakeLength - 1; i++) {
        this.m_snake[i][0] = this.m_snake[i + 1][0];
        this.m_snake[i][1] = this.m_snake[i + 1][1];
      }
      this.m_snake[snakeLength - 1][0] = testRow;
      this.m_snake[snakeLength - 1][1] = testColumn;
      this.g_getCellNode(testRow, testColumn).addClass('snake');
    }
  },

  // 将方块朝一个方向移动
  _moveBlockDirection: function() {
    switch (this.m_snakeDirection) {
      case Direction.Down:
        this._moveBlockDown();
        break;
      case Direction.Up:
        this._moveBlockUp();
        break;
      case Direction.Left:
        this._moveBlockLeft();
        break;
      case Direction.Right:
        this._moveBlockRight();
        break;
    }
  },

  _moveBlockDown: function() {
    this._moveBlock(1, 0);
  },

  _moveBlockUp: function() {
    this._moveBlock(-1, 0);
  },

  _moveBlockLeft: function() {
    this._moveBlock(0, -1);
  },

  _moveBlockRight: function() {
    this._moveBlock(0, 1);
  },


  // 空函数
  empty: function() {}
});

new CSnake();
