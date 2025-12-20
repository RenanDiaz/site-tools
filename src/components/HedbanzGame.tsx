import type { FC, ChangeEvent } from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Input,
  Label,
  Row,
  Col,
  Badge,
  ButtonGroup,
} from "reactstrap";
import styled from "styled-components";

const GameScreen = styled.div<{ $isFullscreen: boolean }>`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-radius: ${(props) => (props.$isFullscreen ? "0" : "1rem")};
  padding: 2rem;
  min-height: ${(props) => (props.$isFullscreen ? "100vh" : "400px")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: ${(props) => (props.$isFullscreen ? "fixed" : "relative")};
  top: ${(props) => (props.$isFullscreen ? "0" : "auto")};
  left: ${(props) => (props.$isFullscreen ? "0" : "auto")};
  right: ${(props) => (props.$isFullscreen ? "0" : "auto")};
  bottom: ${(props) => (props.$isFullscreen ? "0" : "auto")};
  z-index: ${(props) => (props.$isFullscreen ? "9999" : "1")};
`;

const EmojiDisplay = styled.div`
  font-size: clamp(4rem, 15vw, 10rem);
  line-height: 1;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
`;

const CharacterDisplay = styled.div`
  font-size: clamp(2rem, 8vw, 5rem);
  font-weight: bold;
  color: #e94560;
  text-align: center;
  text-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
  margin: 1rem 0;
  word-break: break-word;
  max-width: 90%;
`;

const CategoryBadge = styled(Badge)`
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const GameControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const HiddenMessage = styled.div`
  font-size: 1.5rem;
  color: #aaa;
  text-align: center;
`;

const CustomInput = styled(Input)`
  field-sizing: content;
  max-height: 200px;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled(Badge)`
  cursor: pointer;
  font-size: 0.9rem;
  &:hover {
    opacity: 0.8;
  }
`;

const TimerDisplay = styled.div<{ $isWarning: boolean; $isExpired: boolean }>`
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: bold;
  color: ${(props) =>
    props.$isExpired ? "#ff4444" : props.$isWarning ? "#ffaa00" : "#44ff44"};
  text-shadow: 0 0 20px
    ${(props) =>
      props.$isExpired
        ? "rgba(255, 68, 68, 0.5)"
        : props.$isWarning
          ? "rgba(255, 170, 0, 0.5)"
          : "rgba(68, 255, 68, 0.5)"};
  margin-top: 1rem;
  font-variant-numeric: tabular-nums;
`;

const TimerBar = styled.div<{ $progress: number; $isWarning: boolean }>`
  width: 100%;
  max-width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(props) => props.$progress}%;
    background: ${(props) => (props.$isWarning ? "#ffaa00" : "#44ff44")};
    transition: width 0.1s linear;
  }
`;

const TimerPresetButton = styled(Button)<{ $active: boolean }>`
  opacity: ${(props) => (props.$active ? 1 : 0.6)};
`;

interface CategoryItem {
  name: string;
  emoji: string;
}

interface Category {
  name: string;
  icon: string;
  items: CategoryItem[];
}

const defaultCategories: Category[] = [
  {
    name: "Personajes de Peliculas",
    icon: "🎬",
    items: [
      { name: "Harry Potter", emoji: "🧙" },
      { name: "Darth Vader", emoji: "👨‍🚀" },
      { name: "Jack Sparrow", emoji: "🏴‍☠️" },
      { name: "Shrek", emoji: "👹" },
      { name: "Batman", emoji: "🦇" },
      { name: "Spider-Man", emoji: "🕷️" },
      { name: "Elsa", emoji: "❄️" },
      { name: "Woody", emoji: "🤠" },
      { name: "Iron Man", emoji: "🦾" },
      { name: "Gollum", emoji: "💍" },
      { name: "Forrest Gump", emoji: "🏃" },
      { name: "Indiana Jones", emoji: "🤠" },
      { name: "Terminator", emoji: "🤖" },
      { name: "E.T.", emoji: "👽" },
      { name: "Yoda", emoji: "🧝" },
    ],
  },
  {
    name: "Animales",
    icon: "🦁",
    items: [
      { name: "Leon", emoji: "🦁" },
      { name: "Elefante", emoji: "🐘" },
      { name: "Pinguino", emoji: "🐧" },
      { name: "Cocodrilo", emoji: "🐊" },
      { name: "Aguila", emoji: "🦅" },
      { name: "Delfin", emoji: "🐬" },
      { name: "Canguro", emoji: "🦘" },
      { name: "Jirafa", emoji: "🦒" },
      { name: "Pulpo", emoji: "🐙" },
      { name: "Koala", emoji: "🐨" },
      { name: "Tiburon", emoji: "🦈" },
      { name: "Mariposa", emoji: "🦋" },
      { name: "Tortuga", emoji: "🐢" },
      { name: "Buho", emoji: "🦉" },
      { name: "Camaleon", emoji: "🦎" },
    ],
  },
  {
    name: "Profesiones",
    icon: "👨‍⚕️",
    items: [
      { name: "Medico", emoji: "👨‍⚕️" },
      { name: "Astronauta", emoji: "👨‍🚀" },
      { name: "Chef", emoji: "👨‍🍳" },
      { name: "Bombero", emoji: "👨‍🚒" },
      { name: "Piloto", emoji: "👨‍✈️" },
      { name: "Detective", emoji: "🕵️" },
      { name: "Veterinario", emoji: "👨‍⚕️" },
      { name: "Cientifico", emoji: "👨‍🔬" },
      { name: "Musico", emoji: "🎸" },
      { name: "Fotografo", emoji: "📸" },
      { name: "Arquitecto", emoji: "📐" },
      { name: "Maestro", emoji: "👨‍🏫" },
      { name: "Abogado", emoji: "⚖️" },
      { name: "Periodista", emoji: "📰" },
      { name: "Atleta", emoji: "🏃" },
    ],
  },
  {
    name: "Comida",
    icon: "🍕",
    items: [
      { name: "Pizza", emoji: "🍕" },
      { name: "Hamburguesa", emoji: "🍔" },
      { name: "Sushi", emoji: "🍣" },
      { name: "Tacos", emoji: "🌮" },
      { name: "Helado", emoji: "🍦" },
      { name: "Pasta", emoji: "🍝" },
      { name: "Chocolate", emoji: "🍫" },
      { name: "Paella", emoji: "🥘" },
      { name: "Hot Dog", emoji: "🌭" },
      { name: "Dona", emoji: "🍩" },
      { name: "Croissant", emoji: "🥐" },
      { name: "Ramen", emoji: "🍜" },
      { name: "Burrito", emoji: "🌯" },
      { name: "Waffles", emoji: "🧇" },
      { name: "Nachos", emoji: "🧀" },
    ],
  },
  {
    name: "Objetos",
    icon: "📱",
    items: [
      { name: "Telefono", emoji: "📱" },
      { name: "Paraguas", emoji: "☂️" },
      { name: "Guitarra", emoji: "🎸" },
      { name: "Bicicleta", emoji: "🚲" },
      { name: "Reloj", emoji: "⌚" },
      { name: "Espejo", emoji: "🪞" },
      { name: "Lampara", emoji: "💡" },
      { name: "Televisor", emoji: "📺" },
      { name: "Computadora", emoji: "💻" },
      { name: "Camara", emoji: "📷" },
      { name: "Libro", emoji: "📖" },
      { name: "Tijeras", emoji: "✂️" },
      { name: "Martillo", emoji: "🔨" },
      { name: "Globo", emoji: "🎈" },
      { name: "Silla", emoji: "🪑" },
    ],
  },
];

const TIMER_PRESETS = [
  { label: "30s", value: 30 },
  { label: "1 min", value: 60 },
  { label: "1:30", value: 90 },
  { label: "2 min", value: 120 },
  { label: "Sin limite", value: 0 },
];

export const HedbanzGame: FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Personajes de Peliculas",
  ]);
  const [customItems, setCustomItems] = useState<string>("");
  const [currentItem, setCurrentItem] = useState<CategoryItem | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [usedItems, setUsedItems] = useState<Set<string>>(new Set());

  // Timer state
  const [timerDuration, setTimerDuration] = useState<number>(60);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;

      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio not supported, silent fail
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerDuration === 0) return;

    stopTimer();
    setTimeRemaining(timerDuration);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          stopTimer();
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerDuration, stopTimer, playBeep]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getAllItems = useCallback((): {
    item: CategoryItem;
    category: string;
  }[] => {
    const items: { item: CategoryItem; category: string }[] = [];

    for (const category of defaultCategories) {
      if (selectedCategories.includes(category.name)) {
        for (const item of category.items) {
          items.push({ item, category: category.name });
        }
      }
    }

    if (customItems.trim()) {
      const custom = customItems
        .split("\n")
        .map((i) => i.trim())
        .filter((i) => i);
      for (const name of custom) {
        items.push({ item: { name, emoji: "🎭" }, category: "Personalizado" });
      }
    }

    return items;
  }, [selectedCategories, customItems]);

  const getRandomItem = useCallback(() => {
    const allItems = getAllItems();
    const availableItems = allItems.filter(
      (i) => !usedItems.has(i.item.name)
    );

    if (availableItems.length === 0) {
      setUsedItems(new Set());
      const randomIndex = Math.floor(Math.random() * allItems.length);
      const selected = allItems[randomIndex];
      if (selected) {
        setCurrentItem(selected.item);
        setCurrentCategory(selected.category);
        setUsedItems(new Set([selected.item.name]));
      }
    } else {
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const selected = availableItems[randomIndex];
      if (selected) {
        setCurrentItem(selected.item);
        setCurrentCategory(selected.category);
        setUsedItems((prev) => new Set([...prev, selected.item.name]));
      }
    }
    setIsRevealed(false);
    startTimer();
  }, [getAllItems, usedItems, startTimer]);

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleCustomItemsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCustomItems(e.target.value);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleNextItem = () => {
    getRandomItem();
  };

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  const handleReset = () => {
    setUsedItems(new Set());
    setCurrentItem(null);
    setCurrentCategory("");
    setIsRevealed(false);
    stopTimer();
    setTimeRemaining(null);
  };

  const handleTimerPreset = (value: number) => {
    setTimerDuration(value);
    setCustomDuration("");
  };

  const handleCustomDuration = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDuration(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setTimerDuration(parsed);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalItems = getAllItems().length;
  const remainingItems = totalItems - usedItems.size;
  const timerProgress =
    timerDuration > 0 && timeRemaining !== null
      ? (timeRemaining / timerDuration) * 100
      : 100;
  const isTimerWarning = timeRemaining !== null && timeRemaining <= 10;
  const isTimerExpired = timeRemaining === 0;

  return (
    <>
      <h2>Hedbanz - Adivina Quien</h2>
      <p>
        Un jugador no mira la pantalla mientras los demas ven el personaje y dan
        pistas. El jugador debe adivinar quien o que es!
      </p>

      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <CardBody>
              <h5>Categorias</h5>
              <TagContainer>
                {defaultCategories.map((category) => (
                  <Tag
                    key={category.name}
                    color={
                      selectedCategories.includes(category.name)
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() => handleCategoryToggle(category.name)}
                  >
                    {category.icon} {category.name} ({category.items.length})
                  </Tag>
                ))}
              </TagContainer>
            </CardBody>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <CardBody>
              <FormGroup>
                <Label for="customItems">
                  <h5>Personajes personalizados</h5>
                </Label>
                <CustomInput
                  type="textarea"
                  id="customItems"
                  placeholder="Escribe un personaje por linea..."
                  value={customItems}
                  onChange={handleCustomItemsChange}
                  rows={3}
                />
              </FormGroup>
            </CardBody>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <CardBody>
              <h5>Temporizador</h5>
              <ButtonGroup className="mb-2 flex-wrap">
                {TIMER_PRESETS.map((preset) => (
                  <TimerPresetButton
                    key={preset.value}
                    size="sm"
                    color="primary"
                    outline
                    $active={timerDuration === preset.value && !customDuration}
                    onClick={() => handleTimerPreset(preset.value)}
                  >
                    {preset.label}
                  </TimerPresetButton>
                ))}
              </ButtonGroup>
              <Input
                type="number"
                placeholder="Segundos personalizados..."
                value={customDuration}
                onChange={handleCustomDuration}
                min={1}
                bsSize="sm"
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <div className="mb-3">
        <Badge color="info" className="me-2">
          Total: {totalItems}
        </Badge>
        <Badge color="success">Restantes: {remainingItems}</Badge>
      </div>

      <GameScreen $isFullscreen={isFullscreen}>
        {isFullscreen && (
          <Button
            color="secondary"
            size="sm"
            onClick={toggleFullscreen}
            style={{ position: "absolute", top: "1rem", right: "1rem" }}
          >
            Salir
          </Button>
        )}

        {currentItem ? (
          <>
            <CategoryBadge color="info">{currentCategory}</CategoryBadge>
            {isRevealed ? (
              <>
                <EmojiDisplay>{currentItem.emoji}</EmojiDisplay>
                <CharacterDisplay>{currentItem.name}</CharacterDisplay>
              </>
            ) : (
              <>
                <EmojiDisplay>❓</EmojiDisplay>
                <CharacterDisplay>???</CharacterDisplay>
              </>
            )}
            {timerDuration > 0 && timeRemaining !== null && (
              <>
                <TimerDisplay
                  $isWarning={isTimerWarning}
                  $isExpired={isTimerExpired}
                >
                  {formatTime(timeRemaining)}
                </TimerDisplay>
                <TimerBar $progress={timerProgress} $isWarning={isTimerWarning} />
              </>
            )}
            {isTimerExpired && (
              <Badge color="danger" className="mt-2" style={{ fontSize: "1rem" }}>
                Tiempo agotado!
              </Badge>
            )}
          </>
        ) : (
          <HiddenMessage>
            Presiona &quot;Nuevo Personaje&quot; para comenzar
          </HiddenMessage>
        )}

        <GameControls>
          {currentItem && (
            <Button color="warning" size="lg" onClick={toggleReveal}>
              {isRevealed ? "Ocultar" : "Revelar"}
            </Button>
          )}
          <Button
            color="success"
            size="lg"
            onClick={handleNextItem}
            disabled={totalItems === 0}
          >
            {currentItem ? "Siguiente" : "Nuevo Personaje"}
          </Button>
          {!isFullscreen && (
            <Button color="primary" size="lg" onClick={toggleFullscreen}>
              Pantalla Completa
            </Button>
          )}
          {usedItems.size > 0 && (
            <Button color="danger" size="lg" onClick={handleReset}>
              Reiniciar
            </Button>
          )}
        </GameControls>
      </GameScreen>
    </>
  );
};
