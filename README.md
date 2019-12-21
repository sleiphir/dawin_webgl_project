# THREE.JS Project - Simon Lasbrugnas

## The project

The goal of this project is to display the equivalent of a small planet (a sphere basically) with a drivable car that goes around it.
Everything in a flat 3D design

## How does it works ?

There isn't really a point, this is not a game, this is more of a showcase.
You can drive around a sphere with a car using the arrow keys ⇓ ⇑ ⇐ ⇒ on your keyboard.

On the right-hand side there are 2 options available:

* Time: Clicking on the button 'day' will toggle the scene to 'night' and you will be able to see stars in the sky as well as your car headlights and a UFO in orbit.
* Camera: Clicking on the button 'free' will 'lock' the camera on top of your car so you can see where you're going at all time.

## My experience doing this project

I got the idea of a car driving around a tiny planet from a YouTube video I saw over a year ago, it was a Unity tutorial about something I completely forgot and I wasn't able to find the video again, but the idea was there so I took it.

The main problem I encountered during this project was how to manage to get the car to drive around the sphere. I'm not very good with quaternions and matrix so I was struggling a lot trying to calculate with sine, cosine, tangents and the position of the car relative to the sphere the rotation in xyz it should have etc... But after thinking about it a lot I remembered how we grouped multiple objects to create the statues in our scene and that the group had its own position and _center of rotation_. So I figured out that if I created an empty object with a position of 0,0,0 and added the car to it, it would translate the pivot of the car to 0,0,0. After a little bit more research on how to rotate an object using it's local axis relative to the world, I found .rotateOnAxis that uses a normalized vector to indicate the direction. And with the pivot of the car placed at the center of the sphere and the .rotateOnAxis method, I was able to implement this feature pretty easily and I can't even wrap my head around how much complicated it would have been in pure WebGL (_thank you Three.JS_).

After struggling this much for the car, it took me 5 minutes to implement the orbit of the UFO around the sphere as it was the exact same logic.

Before I implement the stars the way I did, I tried using a really big double sided sphere like we saw in class with a texture applied to it using 360 space pics but each time I found the result either disappointing or it didn't match the rest of the scene. So I decided to try with really small spheres thinking it would make the scene really laggy but to my surprise it wasn't, it's another story for ram consumption though, but I think the result is pretty good and it was really the effect I intended.

Working both on my laptop and my desktop computer, I realized that the speed at which the animation were played was different, which made me realise that the animation speed was tied to the speed at which frames were rendered, ideally every 16.67ms (1000/60) on 60hz monitors, 6.94ms (1000/144) at 144hz and 4.17ms (1000/240) on 240hz monitors. My laptop screen being 60hz and one of my desktop monitor being 240hz the animation speed was 4 times greater on my PC, so I figured out a way of setting the animation speed to the same value whatever the refresh rate by calculating the time it takes to render every frame and storing it so I could multiply the speed by the value I called 'frametime'. I later added an array of the last 10 frametimes to have a mean value to use instead of the raw frametime because it was causing some stutter on my laptop.

Even though I struggled to implement the driving feature, having worked on a 3D presentation website at work using Three.JS, it helped me a lot in understanding how the Three methods work and what's the logic behind it.

## What I learned

* I learned how .obj models go with .mtl materials and how they are composed with the textures and maps (roughness, normal, bump ...).

* I learned how to make _simple_ materials and roughness, height and bump maps, I'm still learning how to create normal maps.

* I learned a lot about local / world coordinates and rotations and in which situation they can be used.

* Overall, this project improved my 3d knowledge and Three.JS skills by a considerable margin and I enjoyed doing it.

## List of things to implement

- <s>An empty scene</s>
- <s>The sphere</s>
- <s>loading the car</s>
- <s>managing user input (probably arrow keys)</s>
- <s>find a way to get the car to rotate around the sphere ??</s>
- <s>add a on / off button on an overlay to disable the main light source so we can see the car's headlights</s>
- <s>Add an UFO orbiting around the sphere, visible during the night</s>
- <s>Add a button to lock the camera on top of the car</s>
- <s>Add stars in the distance</s>

## Commands

```bash
npm install
npx http-server
```
