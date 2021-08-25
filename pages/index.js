import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import styles from "../styles/Snake.module.css";

const Config = {
  height: 20,
  width: 20,
  cellSize: 32,
};

const CellType = {
  Snake: "snake",
  Food: "food",
  Empty: "empty",
};

const Direction = {
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
  Top: { x: 0, y: -1 },
  Bottom: { x: 0, y: 1 },
};

const Cell = ({ x, y, type }) => {
  const getStyles = () => {
    switch (type) {
      case CellType.Snake:
        return {
          backgroundColor: "yellowgreen",
          borderRadius: 8,
          padding: 2,
        };

      case CellType.Food:
        return {
          backgroundColor: "darkorange",
          borderRadius: 20,
          width: 32,
          height: 32,
        };

      default:
        return {};
    }
  };

  return (
    <div
      className={styles.cellContainer}
      style={{
        left: x * Config.cellSize,
        top: y * Config.cellSize,
        width: Config.cellSize,
        height: Config.cellSize,
      }}
    >
      <div className={styles.cell} style={getStyles()}></div>
    </div>
  );
};

const getRandomCell = () => ({
  x: Math.floor(Math.random() * Config.width),
  y: Math.floor(Math.random() * Config.width),
});

const getDefaultSnake = () => [
  { x: 8, y: 12 },
  { x: 7, y: 12 },
  { x: 6, y: 12 },
];

const Snake = () => {
  // snake[0] is head and snake[snake.length - 1] is tail
  const [snake, setSnake] = useState(getDefaultSnake());
  const [direction, setDirection] = useState(Direction.Right);

  const [food, setFood] = useState({ x: 4, y: 10 });
  const [score, setScore] = useState(0);

  // move the snake
  useEffect(() => {
    const runSingleStep = () => {
      setSnake((snake) => {
        const head = snake[0];

        // reappearing snake based on co-ordinates
        let x = head.x + direction.x;
        let y = head.y + direction.y;

        if (x === -1) x = Config.width;
        else if (x === Config.width) x = 0;

        if (y === -1) y = Config.height;
        else if (y === Config.height) y = 0;

        const newHead = { x, y };
        const isBiting = snake.find((pos) => pos.x === x && pos.y === y);

        if (isBiting) {
          setSnake(getDefaultSnake());
          setScore(0);
        }

        // make a new snake by extending head
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        const newSnake = [newHead, ...snake];

        // remove tail
        newSnake.pop();

        return newSnake;
      });
    };

    runSingleStep();

    let timer = setInterval(runSingleStep, 250);

    return () => clearInterval(timer);
  }, [direction, food]);

  // update score whenever head touches a food
  useEffect(() => {
    const head = snake[0];

    if (isFood(head)) {
      setScore((score) => score + 1);
      setSnake((snake) => [...snake, head]);

      let newFood = getRandomCell();

      while (isSnake(newFood)) {
        newFood = getRandomCell();
      }

      setFood(newFood);
    }
  }, [isFood, snake]);

  useEffect(() => {
    const handleNavigation = (event) => {
      switch (event.key) {
        case "ArrowUp":
          setDirection((direction) => {
            if (isEqual(Direction.Bottom, direction)) return direction;
            return Direction.Top;
          });
          break;

        case "ArrowDown":
          setDirection((direction) => {
            if (isEqual(Direction.Top, direction)) return direction;
            return Direction.Bottom;
          });
          break;

        case "ArrowLeft":
          setDirection((direction) => {
            if (isEqual(Direction.Right, direction)) return direction;
            return Direction.Left;
          });
          break;

        case "ArrowRight":
          setDirection((direction) => {
            if (isEqual(Direction.Left, direction)) return direction;
            return Direction.Right;
          });
          break;
      }
    };

    window.addEventListener("keydown", handleNavigation);

    return () => window.removeEventListener("keydown", handleNavigation);
  }, []);

  const test = () => {
    // let newFood = getRandomCell();
    // setFood(newFood);

    const timer = setTimeout(() => {
      clearTimeout(timer);
    }, 10000);
  };

  useEffect(() => {
    test();

    const timer = setInterval(() => {
      test();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // ?. is called optional chaining
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
  const isEqual = (a, b) => a?.x === b?.x && a?.y === b?.y;

  const isFood = useCallback(
    ({ x, y }) => food?.x === x && food?.y === y,
    [food]
  );

  const isSnake = ({ x, y }) =>
    snake.find((position) => position.x === x && position.y === y);

  const renderCells = () => {
    const cells = [];

    for (let x = 0; x < Config.width; x++) {
      for (let y = 0; y < Config.height; y++) {
        let type = CellType.Empty;
        if (isFood({ x, y })) {
          type = CellType.Food;
        } else if (isSnake({ x, y })) {
          type = CellType.Snake;
        }
        cells.push(<Cell key={`${x}-${y}`} x={x} y={y} type={type} />);
      }
    }

    return cells;
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.header}
        style={{ width: Config.width * Config.cellSize }}
      >
        Score: {score}
      </div>
      <div
        className={styles.grid}
        style={{
          height: Config.height * Config.cellSize,
          width: Config.width * Config.cellSize,
        }}
      >
        {renderCells()}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Snake), {
  ssr: false,
});
