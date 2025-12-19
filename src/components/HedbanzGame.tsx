import type { FC, ChangeEvent } from "react";
import { useState, useCallback } from "react";
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

const CharacterDisplay = styled.div`
  font-size: clamp(2rem, 8vw, 5rem);
  font-weight: bold;
  color: #e94560;
  text-align: center;
  text-shadow: 0 0 20px rgba(233, 69, 96, 0.5);
  margin: 2rem 0;
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

interface Category {
  name: string;
  items: string[];
}

const defaultCategories: Category[] = [
  {
    name: "Personajes de Películas",
    items: [
      "Harry Potter",
      "Darth Vader",
      "Jack Sparrow",
      "Shrek",
      "Batman",
      "Spider-Man",
      "Elsa",
      "Woody",
      "Iron Man",
      "Gollum",
      "Forrest Gump",
      "Indiana Jones",
      "Terminator",
      "E.T.",
      "Yoda",
    ],
  },
  {
    name: "Animales",
    items: [
      "León",
      "Elefante",
      "Pingüino",
      "Cocodrilo",
      "Águila",
      "Delfín",
      "Canguro",
      "Jirafa",
      "Pulpo",
      "Koala",
      "Tiburón",
      "Mariposa",
      "Tortuga",
      "Búho",
      "Camaleón",
    ],
  },
  {
    name: "Profesiones",
    items: [
      "Médico",
      "Astronauta",
      "Chef",
      "Bombero",
      "Piloto",
      "Detective",
      "Veterinario",
      "Científico",
      "Músico",
      "Fotógrafo",
      "Arquitecto",
      "Maestro",
      "Abogado",
      "Periodista",
      "Atleta",
    ],
  },
  {
    name: "Comida",
    items: [
      "Pizza",
      "Hamburguesa",
      "Sushi",
      "Tacos",
      "Helado",
      "Pasta",
      "Chocolate",
      "Paella",
      "Hot Dog",
      "Donut",
      "Croissant",
      "Ramen",
      "Burrito",
      "Waffles",
      "Nachos",
    ],
  },
  {
    name: "Objetos",
    items: [
      "Teléfono",
      "Paraguas",
      "Guitarra",
      "Bicicleta",
      "Reloj",
      "Espejo",
      "Lámpara",
      "Televisor",
      "Computadora",
      "Cámara",
      "Libro",
      "Tijeras",
      "Martillo",
      "Globo",
      "Silla",
    ],
  },
];

export const HedbanzGame: FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Personajes de Películas",
  ]);
  const [customItems, setCustomItems] = useState<string>("");
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [usedItems, setUsedItems] = useState<Set<string>>(new Set());

  const getAllItems = useCallback((): { item: string; category: string }[] => {
    const items: { item: string; category: string }[] = [];

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
      for (const item of custom) {
        items.push({ item, category: "Personalizado" });
      }
    }

    return items;
  }, [selectedCategories, customItems]);

  const getRandomItem = useCallback(() => {
    const allItems = getAllItems();
    const availableItems = allItems.filter((i) => !usedItems.has(i.item));

    if (availableItems.length === 0) {
      setUsedItems(new Set());
      const randomIndex = Math.floor(Math.random() * allItems.length);
      const selected = allItems[randomIndex];
      if (selected) {
        setCurrentItem(selected.item);
        setCurrentCategory(selected.category);
        setUsedItems(new Set([selected.item]));
      }
    } else {
      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const selected = availableItems[randomIndex];
      if (selected) {
        setCurrentItem(selected.item);
        setCurrentCategory(selected.category);
        setUsedItems((prev) => new Set([...prev, selected.item]));
      }
    }
    setIsRevealed(false);
  }, [getAllItems, usedItems]);

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

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleReset = () => {
    setUsedItems(new Set());
    setCurrentItem(null);
    setCurrentCategory("");
    setIsRevealed(false);
  };

  const totalItems = getAllItems().length;
  const remainingItems = totalItems - usedItems.size;

  return (
    <>
      <h2>Hedbanz - Adivina Quién</h2>
      <p>
        Un jugador no mira la pantalla mientras los demás ven el personaje y dan
        pistas. ¡El jugador debe adivinar quién o qué es!
      </p>

      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <CardBody>
              <h5>Categorías</h5>
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
                    {category.name} ({category.items.length})
                  </Tag>
                ))}
              </TagContainer>
            </CardBody>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="mb-3">
            <CardBody>
              <FormGroup>
                <Label for="customItems">
                  <h5>Personajes personalizados</h5>
                </Label>
                <CustomInput
                  type="textarea"
                  id="customItems"
                  placeholder="Escribe un personaje por línea..."
                  value={customItems}
                  onChange={handleCustomItemsChange}
                  rows={3}
                />
              </FormGroup>
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
              <CharacterDisplay>{currentItem}</CharacterDisplay>
            ) : (
              <CharacterDisplay>???</CharacterDisplay>
            )}
          </>
        ) : (
          <HiddenMessage>
            Presiona &quot;Nuevo Personaje&quot; para comenzar
          </HiddenMessage>
        )}

        <GameControls>
          {!isRevealed && currentItem && (
            <Button color="warning" size="lg" onClick={handleReveal}>
              Revelar
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
