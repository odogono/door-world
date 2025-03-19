import { createLog } from '@helpers/log';
import { useEffect, useRef, useState } from 'react';
import './index.css';
import { PRNG } from '@helpers/random';

const log = createLog('World2D');

interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  type: RoomType;
  isCentral?: boolean;
  allowedEdges?: ('TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT')[];
}

interface Door {
  room1: Room;
  room2: Room;
  position: { x: number; y: number };
  width: number;
  height: number;
}

enum RoomType {
  NORMAL = 'normal',
  LARGE = 'large',
  SMALL = 'small'
}

const roomToString = (room: Room): string => {
  return `Room(x: ${room.x}, y: ${room.y}, width: ${room.width}, height: ${room.height})`;
};

type RoomSizeRange = [number, number];

const ROOM_SIZE_SMALL: RoomSizeRange = [45, 50];
const ROOM_SIZE_MEDIUM: RoomSizeRange = [50, 80];
const ROOM_SIZE_LARGE: RoomSizeRange = [80, 120];

const ROOM_MIN_SIZE = 10;
const ROOM_MAX_SIZE = 100;
const NUM_ROOMS_PER_CLICK = 3;
const CANVAS_SIZE = 1024;
const DOOR_WIDTH = 8;
const DOOR_HEIGHT = 12;

// Create a single PRNG instance for the entire application
const prng = new PRNG();

const getRoomSizeForType = (
  type: RoomType
): { width: number; height: number } => {
  switch (type) {
    case RoomType.LARGE:
      return {
        width: prng.nextIntRange(ROOM_SIZE_LARGE),
        height: prng.nextIntRange(ROOM_SIZE_LARGE)
      };
    case RoomType.SMALL:
      return {
        width: prng.nextIntRange(ROOM_SIZE_SMALL),
        height: prng.nextIntRange(ROOM_SIZE_SMALL)
      };
    case RoomType.NORMAL:
    default:
      return {
        width: prng.nextIntRange(ROOM_SIZE_MEDIUM),
        height: prng.nextIntRange(ROOM_SIZE_MEDIUM)
      };
  }
};

const generateRoomAround = (
  targetRoom: Room,
  existingRooms: Room[]
): Room | null => {
  // Randomly select a room type
  const types = Object.values(RoomType);
  const type = types[prng.nextInt(0, types.length - 1)];
  const { width, height } = getRoomSizeForType(type);

  // log.debug('Generating room with dimensions', { width, height, type });

  // Get allowed edges for the target room
  const allowedEdges = targetRoom.allowedEdges || [
    'TOP',
    'BOTTOM',
    'LEFT',
    'RIGHT'
  ];

  // Try each allowed side in random order
  const sides = prng.shuffle(
    allowedEdges
      .map(edge => {
        switch (edge) {
          case 'TOP':
            return 0;
          case 'RIGHT':
            return 1;
          case 'BOTTOM':
            return 2;
          case 'LEFT':
            return 3;
          default:
            return -1;
        }
      })
      .filter(side => side !== -1)
  );

  for (const side of sides) {
    let x = 0;
    let y = 0;

    switch (side) {
      case 0: // Top
        x = targetRoom.x;
        y = targetRoom.y - height;
        break;
      case 1: // Right
        x = targetRoom.x + targetRoom.width;
        y = targetRoom.y;
        break;
      case 2: // Bottom
        x = targetRoom.x;
        y = targetRoom.y + targetRoom.height;
        break;
      case 3: // Left
        x = targetRoom.x - width;
        y = targetRoom.y;
        break;
    }

    // Ensure the room stays within canvas bounds
    x = Math.max(0, Math.min(CANVAS_SIZE - width, x));
    y = Math.max(0, Math.min(CANVAS_SIZE - height, y));

    const newRoom = { x, y, width, height, type };

    // Check if this position is valid
    let isValid = true;
    let invalidReason = '';

    // Check if room is touching the target room
    if (!roomsTouch(newRoom, targetRoom)) {
      isValid = false;
      invalidReason = 'Not touching target room';
    }

    // log.debug('Candidate room', {
    //   room: roomToString(newRoom),
    //   side,
    //   isValid,
    //   invalidReason
    // });

    // Check for overlaps with all existing rooms
    for (const room of existingRooms) {
      if (roomsOverlap(newRoom, room)) {
        isValid = false;
        invalidReason = `Overlaps with ${roomToString(room)}`;
        // log.debug('Room overlap detected', {
        //   newRoom: roomToString(newRoom),
        //   existingRoom: roomToString(room)
        // });
        break;
      }
    }

    if (isValid) {
      // log.debug('Found valid room position', roomToString(newRoom));
      return newRoom;
    }
  }

  return null;
};

const roomsOverlap = (room1: Room, room2: Room): boolean => {
  // Check if rooms overlap (not just touch)
  return (
    room1.x < room2.x + room2.width &&
    room1.x + room1.width > room2.x &&
    room1.y < room2.y + room2.height &&
    room1.y + room1.height > room2.y
  );
};

const roomsTouch = (room1: Room, room2: Room): boolean => {
  // Check if rooms are exactly touching (not overlapping)
  const touchesHorizontally =
    (room1.x + room1.width === room2.x || room2.x + room2.width === room1.x) &&
    !(room1.y + room1.height < room2.y || room2.y + room2.height < room1.y);

  const touchesVertically =
    (room1.y + room1.height === room2.y ||
      room2.y + room2.height === room1.y) &&
    !(room1.x + room1.width < room2.x || room2.x + room2.width < room1.x);

  // log.debug('Checking if rooms touch', {
  //   room1: roomToString(room1),
  //   room2: roomToString(room2),
  //   touchesHorizontally,
  //   touchesVertically
  // });

  return touchesHorizontally || touchesVertically;
};

const getRoomCenter = (room: Room): { x: number; y: number } => {
  return {
    x: room.x + room.width / 2,
    y: room.y + room.height / 2
  };
};

const getDistanceBetweenRooms = (room1: Room, room2: Room): number => {
  const center1 = getRoomCenter(room1);
  const center2 = getRoomCenter(room2);
  return Math.sqrt(
    Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2)
  );
};

const isPointInRoom = (
  point: { x: number; y: number },
  room: Room
): boolean => {
  return (
    point.x >= room.x &&
    point.x <= room.x + room.width &&
    point.y >= room.y &&
    point.y <= room.y + room.height
  );
};

// Room generation strategy interface
interface RoomGenerationStrategy {
  selectTargetRoom(rooms: Room[]): Room;
  shouldContinueGeneration(
    attempts: number,
    maxAttempts: number,
    roomsGenerated: number,
    maxRooms: number,
    consecutiveFailures: number,
    maxConsecutiveFailures: number
  ): boolean;
}

// Random strategy (current implementation)
class RandomStrategy implements RoomGenerationStrategy {
  selectTargetRoom(rooms: Room[]): Room {
    return rooms[prng.nextInt(0, rooms.length - 1)];
  }

  shouldContinueGeneration(
    attempts: number,
    maxAttempts: number,
    roomsGenerated: number,
    maxRooms: number,
    consecutiveFailures: number,
    maxConsecutiveFailures: number
  ): boolean {
    return (
      attempts < maxAttempts &&
      roomsGenerated < maxRooms &&
      consecutiveFailures < maxConsecutiveFailures
    );
  }
}

// Growth direction strategy
class GrowthDirectionStrategy implements RoomGenerationStrategy {
  private getRoomFrontier(room: Room): number {
    // Calculate how close the room is to the edges
    const distanceToLeft = room.x;
    const distanceToRight = CANVAS_SIZE - (room.x + room.width);
    const distanceToTop = room.y;
    const distanceToBottom = CANVAS_SIZE - (room.y + room.height);

    // Return the minimum distance to any edge
    return Math.min(
      distanceToLeft,
      distanceToRight,
      distanceToTop,
      distanceToBottom
    );
  }

  private getRoomGrowthScore(room: Room): number {
    // Calculate a score that favors rooms that:
    // 1. Are close to edges (but not necessarily at them)
    // 2. Have fewer adjacent rooms
    // 3. Are not too close to the center

    const frontier = this.getRoomFrontier(room);
    const center = CANVAS_SIZE / 2;
    const roomCenterX = room.x + room.width / 2;
    const roomCenterY = room.y + room.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(roomCenterX - center, 2) + Math.pow(roomCenterY - center, 2)
    );

    // Favor rooms that are:
    // - Within 100 pixels of an edge (but not necessarily at it)
    // - Not too close to the center
    // - Have more space around them
    const edgeScore = Math.max(0, 100 - frontier);
    const centerScore = Math.max(0, distanceFromCenter - 200);
    const combinedScore = edgeScore + centerScore * 0.5;

    return combinedScore;
  }

  selectTargetRoom(rooms: Room[]): Room {
    // Sort rooms by their growth score (highest first)
    const sortedRooms = [...rooms].sort(
      (a, b) => this.getRoomGrowthScore(b) - this.getRoomGrowthScore(a)
    );

    // Select from the 5 rooms with the highest growth scores
    const candidates = sortedRooms.slice(0, Math.min(5, sortedRooms.length));
    return candidates[prng.nextInt(0, candidates.length - 1)];
  }

  shouldContinueGeneration(
    attempts: number,
    maxAttempts: number,
    roomsGenerated: number,
    maxRooms: number,
    consecutiveFailures: number,
    maxConsecutiveFailures: number
  ): boolean {
    // Continue if we haven't hit any limits
    return (
      attempts < maxAttempts &&
      roomsGenerated < maxRooms &&
      consecutiveFailures < maxConsecutiveFailures
    );
  }
}

// Strategy factory
const createStrategy = (type: 'random' | 'growth'): RoomGenerationStrategy => {
  switch (type) {
    case 'growth':
      return new GrowthDirectionStrategy();
    case 'random':
    default:
      return new RandomStrategy();
  }
};

const generateDungeon = (
  fillSpace: boolean = false,
  strategy: 'random' | 'growth' = 'random'
): Room[] => {
  const rooms: Room[] = [];
  const generationStrategy = createStrategy(strategy);

  // Create central room with only TOP edge allowed
  const centralRoom: Room = {
    x: CANVAS_SIZE / 2 - 50,
    y: CANVAS_SIZE / 2 - 50,
    width: 100,
    height: 100,
    type: RoomType.NORMAL,
    isCentral: true,
    allowedEdges: ['TOP']
  };
  rooms.push(centralRoom);

  // Generate multiple rooms around the central room
  let attempts = 0;
  const maxAttempts = fillSpace ? 1000 : 100;
  let roomsGenerated = 0;
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 50;

  while (
    generationStrategy.shouldContinueGeneration(
      attempts,
      maxAttempts,
      roomsGenerated,
      fillSpace ? Infinity : NUM_ROOMS_PER_CLICK,
      consecutiveFailures,
      maxConsecutiveFailures
    )
  ) {
    // Select target room using the strategy
    const targetRoom = generationStrategy.selectTargetRoom(rooms);
    const newRoom = generateRoomAround(targetRoom, rooms);

    if (newRoom) {
      rooms.push(newRoom);
      roomsGenerated++;
      consecutiveFailures = 0;
    } else {
      consecutiveFailures++;
      if (consecutiveFailures >= maxConsecutiveFailures) {
        log.debug(
          'Stopping room generation after',
          consecutiveFailures,
          'consecutive failures'
        );
        break;
      }
    }

    attempts++;
    if (attempts >= maxAttempts) {
      log.debug(
        'Failed to find valid room position after',
        maxAttempts,
        'attempts'
      );
    }
  }

  return rooms;
};

const generateRoomsAround = (rooms: Room[], targetRoom: Room): Room[] => {
  const newRooms: Room[] = [...rooms];

  log.debug('Generating room around', roomToString(targetRoom));

  let attempts = 0;
  const maxAttempts = 10;
  let roomsGenerated = 0;

  while (attempts < maxAttempts && roomsGenerated < NUM_ROOMS_PER_CLICK) {
    const newRoom = generateRoomAround(targetRoom, newRooms);

    if (newRoom) {
      log.debug('Found valid room position', roomToString(newRoom));
      newRooms.push(newRoom);
      roomsGenerated++;
    }

    attempts++;
    if (attempts >= maxAttempts) {
      log.debug(
        'Failed to find valid room position after',
        maxAttempts,
        'attempts'
      );
    }
  }

  log.debug('New rooms array length', newRooms.length);
  return newRooms;
};

const findDoorPosition = (
  room1: Room,
  room2: Room
): { x: number; y: number } | null => {
  // Determine which room is the target and which is the other
  const targetRoom = room1.allowedEdges ? room1 : room2;
  const otherRoom = room1.allowedEdges ? room2 : room1;

  // Get allowed edges for the target room
  const allowedEdges = targetRoom.allowedEdges || [
    'TOP',
    'BOTTOM',
    'LEFT',
    'RIGHT'
  ];

  // Determine which edge the other room is touching
  let touchingEdge: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | null = null;

  // Check if rooms are touching on any edge
  if (otherRoom.y + otherRoom.height === targetRoom.y) {
    touchingEdge = 'TOP';
  } else if (targetRoom.y + targetRoom.height === otherRoom.y) {
    touchingEdge = 'BOTTOM';
  } else if (otherRoom.x + otherRoom.width === targetRoom.x) {
    touchingEdge = 'LEFT';
  } else if (targetRoom.x + targetRoom.width === otherRoom.x) {
    touchingEdge = 'RIGHT';
  }

  // If rooms aren't touching or the touching edge isn't allowed, return null
  if (!touchingEdge || !allowedEdges.includes(touchingEdge)) {
    return null;
  }

  // Find overlapping range for door placement
  let xOverlap: number;
  let yOverlap: number;

  if (touchingEdge === 'TOP' || touchingEdge === 'BOTTOM') {
    // For vertical edges, find horizontal overlap
    xOverlap =
      Math.min(targetRoom.x + targetRoom.width, otherRoom.x + otherRoom.width) -
      Math.max(targetRoom.x, otherRoom.x);

    if (xOverlap >= DOOR_WIDTH) {
      const x =
        Math.max(targetRoom.x, otherRoom.x) + (xOverlap - DOOR_WIDTH) / 2;
      const y =
        touchingEdge === 'TOP'
          ? targetRoom.y - DOOR_HEIGHT / 2
          : targetRoom.y + targetRoom.height - DOOR_HEIGHT / 2;
      return { x, y };
    }
  } else {
    // For horizontal edges, find vertical overlap
    yOverlap =
      Math.min(
        targetRoom.y + targetRoom.height,
        otherRoom.y + otherRoom.height
      ) - Math.max(targetRoom.y, otherRoom.y);

    if (yOverlap >= DOOR_HEIGHT) {
      const y =
        Math.max(targetRoom.y, otherRoom.y) + (yOverlap - DOOR_HEIGHT) / 2;
      const x =
        touchingEdge === 'LEFT'
          ? targetRoom.x - DOOR_WIDTH / 2
          : targetRoom.x + targetRoom.width - DOOR_WIDTH / 2;
      return { x, y };
    }
  }

  return null;
};

const findDoors = (rooms: Room[]): Door[] => {
  const doors: Door[] = [];

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (roomsTouch(rooms[i], rooms[j])) {
        const position = findDoorPosition(rooms[i], rooms[j]);
        if (position) {
          doors.push({
            room1: rooms[i],
            room2: rooms[j],
            position,
            width: DOOR_WIDTH,
            height: DOOR_HEIGHT
          });
        }
      }
    }
  }

  return doors;
};

export const World2D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [clickedRoom, setClickedRoom] = useState<Room | null>(null);

  useEffect(() => {
    const initialRooms = generateDungeon(true, 'growth'); // Using growth strategy
    log.debug('Initial rooms generated', initialRooms.length);
    setRooms(initialRooms);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw rooms
    for (const room of rooms) {
      // Draw room fill based on type
      switch (room.type) {
        case RoomType.LARGE:
          ctx.fillStyle = room === clickedRoom ? '#444' : '#222';
          break;
        case RoomType.SMALL:
          ctx.fillStyle = room === clickedRoom ? '#555' : '#333';
          break;
        case RoomType.NORMAL:
        default:
          ctx.fillStyle = room === clickedRoom ? '#666' : '#444';
      }
      ctx.fillRect(room.x, room.y, room.width, room.height);

      // Draw room border
      ctx.strokeStyle = room === clickedRoom ? '#fff' : '#666';
      ctx.lineWidth = room === clickedRoom ? 2 : 1;
      ctx.strokeRect(room.x, room.y, room.width, room.height);

      // Draw room type label
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        room.isCentral ? 'Start' : '',
        room.x + room.width / 2,
        room.y + room.height / 2
      );
    }

    // Draw doors
    const doors = findDoors(rooms);
    for (const door of doors) {
      // Draw door frame
      ctx.fillStyle = '#000';
      ctx.fillRect(door.position.x, door.position.y, door.width, door.height);

      // Draw door
      ctx.fillStyle = '#brown';
      ctx.fillRect(
        door.position.x + 1,
        door.position.y + 1,
        door.width - 2,
        door.height - 2
      );
    }

    // Draw room connection indicators (only for rooms with doors)
    ctx.strokeStyle = '#00ff00aa';
    ctx.lineWidth = 2;
    for (const door of doors) {
      // Draw a line between rooms that have doors
      const center1 = getRoomCenter(door.room1);
      const center2 = getRoomCenter(door.room2);
      ctx.beginPath();
      ctx.moveTo(center1.x, center1.y);
      ctx.lineTo(center2.x, center2.y);
      ctx.stroke();
    }

    // Draw room centers (for debugging)
    ctx.fillStyle = '#f00';
    for (const room of rooms) {
      const center = getRoomCenter(room);
      ctx.beginPath();
      ctx.arc(center.x, center.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [rooms, clickedRoom]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked room
    const clickedRoom = rooms.find(room => isPointInRoom({ x, y }, room));
    if (clickedRoom) {
      log.debug('Room clicked', roomToString(clickedRoom));
      setClickedRoom(clickedRoom);

      const newRooms = generateRoomsAround(rooms, clickedRoom);
      log.debug('Setting new rooms', newRooms.length);
      setRooms(newRooms);

      // Reset clicked room after a short delay
      setTimeout(() => {
        setClickedRoom(null);
      }, 200);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          border: '1px solid #666',
          backgroundColor: '#000'
        }}
      />
    </div>
  );
};
