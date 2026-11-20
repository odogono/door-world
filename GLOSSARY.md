# Door World

A navigable, procedurally generated world of rooms joined by doors, which a
visitor explores one room at a time.

## The world

**Door World**:
The product: the explorable world as a host site embeds and presents it.
_Avoid_: the app, the game

**Dungeon**:
One generated world: every Room and Door that exists, plus the Seed and
Strategy that produced them. "Dungeon" is the model's name for what the product
calls the world.
_Avoid_: map, level, world (inside the model)

**Room**:
A rectangular space in the Dungeon that the visitor can stand in.
_Avoid_: cell, tile, area

**Door**:
A connection between exactly two adjacent Rooms, which opens to let the
visitor pass.
_Avoid_: portal, exit, edge

**Floor Text**:
Words written on the floor of a Room, chosen by the host for the starting Room.
_Avoid_: label, ground text, title

## Generation

**Seed**:
The number that, with a Strategy, fully determines which Dungeon is generated.

**Strategy**:
The rule for choosing which existing Room the next Room grows from, giving the
Dungeon its overall shape.
_Avoid_: algorithm, generator, mode

## Exploration

**Journey**:
A visitor's passage through the Dungeon, starting in the first Room and moving
through one Door at a time.
_Avoid_: session, playthrough, path

**Current Room**:
The Room the visitor is in now.

**Room History**:
The ordered list of Rooms the visitor has entered on this Journey.
_Avoid_: breadcrumbs, trail

**Visited Room**:
Any Room the visitor has entered at least once on this Journey.
