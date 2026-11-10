import type { MediaItem, MediaKey } from '@/types';

/**
 * Every picture on the site, by key.
 *
 * The key is the file name in media/originals/ without its extension. Sizes
 * come from src/data/media.manifest.json, which `npm run media` writes.
 *
 * EVERY ENTRY BELOW IS A LICENSED STAND-IN (`placeholder: true`), taken from
 * Wikimedia Commons under the licence in its credit. None is Ronin Creative's
 * work. To replace one with the studio's own photograph:
 *
 *   1. Save the new file over media/originals/<key>.jpg (same name).
 *   2. Run `npm run media`.
 *   3. Here: rewrite `alt`, set `placeholder: false` and delete `credit`.
 *
 * No component changes. See the README, "Replacing portfolio images".
 */
export const mediaLibrary: Record<MediaKey, MediaItem> = {
  'drone-flight': {
    alt: 'A white camera drone hovering over water under a pale sky',
    position: '35% 45%',
    placeholder: true,
    credit: {
      author: 'Josh Sorenson',
      licence: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:Quadcopter_camera_drone_in_flight.jpg',
    },
  },
  'aerial-village': {
    alt: 'A small coastal town in a steep valley where the land meets dark blue sea, seen from the air',
    placeholder: true,
    credit: {
      author: 'Clemenspool',
      licence: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:IguestedeSanAndres2024.jpg',
    },
  },
  'aerial-bridge': {
    alt: 'A white concrete arch bridge crossing a forested gorge with a river below',
    placeholder: true,
    credit: {
      author: 'Patrickroque01',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:New_Mangima_Bridge_drone_(Manolo_Fortich,_Bukidnon;_03-21-2026).jpg',
    },
  },
  'aerial-skyline': {
    alt: 'A city skyline against a low sun, with parks and housing in the foreground, seen from a drone',
    position: '50% 35%',
    placeholder: true,
    credit: {
      author: 'Patrickroque01',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Quezon_Memorial_Circle,_Old_Capitol_Site,_QC_skyline_drone_sunset_(Quezon_City;_02-02-2026).jpg',
    },
  },
  'aerial-construction': {
    alt: 'A stadium under construction beside a waterfront, its steel frame and cranes seen from the air',
    placeholder: true,
    credit: {
      author: 'SounderBruce',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Etihad_Park_under_construction_-_aerial_view,_Oct._2025.jpg',
    },
  },
  'aerial-interchange': {
    alt: 'A motorway interchange cutting through blocks of industrial buildings, seen from the air',
    placeholder: true,
    credit: {
      author: 'Coolcaesar',
      licence: 'CC BY 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Aerial_View_of_Interchange_Between_Ontario_Highways_401,_403,_and_410.jpg',
    },
  },
  'aerial-city': {
    alt: 'A dense district of apartment blocks and building plots along a main road, seen from the air',
    placeholder: true,
    credit: {
      author: 'Priyaflorenceshah',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Real_Estate_Development_in_Mumbai.jpg',
    },
  },
  'aerial-coast': {
    alt: 'A rocky shoreline from directly above, green forest on one side and turquoise sea on the other',
    position: '45% 50%',
    placeholder: true,
    credit: {
      author: 'YikyuenG',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Aerial_View,_A_coastline_of_Hailing_Island,_Yangjiang_City.jpg',
    },
  },
  'aerial-island': {
    alt: 'A small green island with rocky edges in deep blue sea, seen from above',
    placeholder: true,
    credit: {
      author: 'YikyuenG',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Aerial_View,_Sanshan_Island,_Hailing_Island,_Jiangcheng_District,_Yangjiang_City.jpg',
    },
  },
  'aerial-beach': {
    alt: 'A long sand beach from the air, with small fishing boats drawn up beside a lagoon',
    position: '40% 60%',
    placeholder: true,
    credit: {
      author: 'Amdadphoto',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Fishing_Harbour_Beach.jpg',
    },
  },
  'aerial-vineyard': {
    alt: 'Curving terraced rows of vines on a hillside, seen from the air',
    placeholder: true,
    credit: {
      author: 'Taxiarchos228',
      licence: 'CC BY 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Aerial_View_-_Landschaft_Markgr%C3%A4flerland1.jpg',
    },
  },
  'aerial-hills': {
    alt: 'Soft green rolling farmland in low morning light, seen from above',
    position: '50% 70%',
    placeholder: true,
    credit: {
      author: 'Caleb Riston',
      licence: 'CC BY 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:PalouseFromSteptoeButteMay2023-2.jpg',
    },
  },
  'hero-home': {
    alt: 'A switchback road climbing a desert cliff while cloud pours over the rim, seen from the air',
    position: '50% 62%',
    placeholder: true,
    credit: {
      author: 'ZeevStein',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:%D7%9E%D7%9B%D7%AA%D7%A9_%D7%A8%D7%9E%D7%95%D7%9F_-_%D7%92%D7%9C%D7%99%D7%A9%D7%AA_%D7%A2%D7%A0%D7%A0%D7%99%D7%9D_(cropped).jpg',
    },
  },
  'aerial-crossing': {
    alt: 'A wide pedestrian crossing and a yellow taxi on dark tarmac, seen from directly above',
    placeholder: true,
    credit: {
      author: 'Dllu',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Crosswalk_of_Market_at_Third,_San_Francisco.jpg',
    },
  },
  'photo-camera': {
    alt: 'A photographer holding a camera up to the eye, the lens facing the viewer, in warm backlight',
    position: '45% 40%',
    placeholder: true,
    credit: {
      author: 'CCØ BAY',
      licence: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:Photographer-camera.jpg',
    },
  },
  'cine-camera': {
    alt: 'A cinema camera on a rig with a matte box, rails and a top handle',
    placeholder: true,
    credit: {
      author: 'Smashing Film',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Blackmagic_Production_Camera_4K_(improved).jpg',
    },
  },
  'photo-studio': {
    alt: 'A photo studio set, with softbox lights arranged around a product table',
    placeholder: true,
    credit: {
      author: 'Hubertl',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Studioarrangement_for_product_photography_and_video_2298.jpg',
    },
  },
  'drone-kit': {
    alt: 'A small drone, its controller and a carrying case on the ground in low evening sun',
    position: '45% 60%',
    placeholder: true,
    credit: {
      author: 'Wacou123',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Remote_Control_FPV_drone_FPV_Goggles.jpg',
    },
  },
  'arch-office': {
    alt: 'A glass corner office building at blue hour, its floors lit and light trails on the street',
    placeholder: true,
    credit: {
      author: 'Dietmar Rabich',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:M%C3%BCnster,_LVM,_B%C3%BCrogeb%C3%A4ude_--_2013_--_5149-51.jpg',
    },
  },
  'arch-facade': {
    alt: 'A curved blue glass facade divided into diagonal panels',
    placeholder: true,
    credit: {
      author: 'Maksim Sokolov',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Fragment_of_160_Front_Street_West,_Toronto.jpg',
    },
  },
  'arch-stairs': {
    alt: 'A white spiral staircase seen from below, in black and white',
    placeholder: true,
    credit: {
      author: 'Petar Milošević',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Spiral_stairs_(Art_Deco,_Neboti%C4%8Dnik,_Ljubljana).jpg',
    },
  },
  'arch-pylon': {
    alt: 'A concrete bridge pylon with fanned cables rising into a black night sky',
    placeholder: true,
    credit: {
      author: 'Petar Milošević',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Ada_Bridge_pylon_(Sava_river,_Belgrade).jpg',
    },
  },
  'event-stage': {
    alt: 'Beams of stage light crossing above a festival crowd at night',
    position: '50% 40%',
    placeholder: true,
    credit: {
      author: 'PinkBeachPlanet',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Beach-Please-2022-crowd-stage-lights-night-performance.jpg',
    },
  },
  'event-dancers': {
    alt: 'Dancers in silhouette in front of red, blue and yellow circles of light on a stage',
    placeholder: true,
    credit: {
      author: 'Virtual-Pano',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:783_3_(%2B_3)_dancers_performing_on_stage_V-P.jpg',
    },
  },
  'event-drums': {
    alt: 'A drummer at a kit on a dark stage, lit from behind through haze',
    placeholder: true,
    credit: {
      author: 'Rickard Laurin',
      licence: 'CC BY-SA 3.0',
      source: 'https://commons.wikimedia.org/wiki/File:Rob_Bourdon_HQ.jpg',
    },
  },
  'model-massing': {
    alt: 'A wooden architectural model of low courtyard buildings on a dark ground',
    placeholder: true,
    credit: {
      author: 'Designer Mario Kleff',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Architectural_Masterplan_Model_of_Lieb_Tang_Rodfai_Villas.jpg',
    },
  },
  'model-city': {
    alt: 'A white scale model of a city district, with rows of buildings and small model trees',
    placeholder: true,
    credit: {
      author: 'Robert-brook',
      licence: 'CC0',
      source: 'https://commons.wikimedia.org/wiki/File:A_section_of_an_architectural_model_on_Durham.jpg',
    },
  },
  'aerial-railworks': {
    alt: 'Rail workers in high-visibility vests repairing a track at night, seen from above',
    placeholder: true,
    credit: {
      author: 'Ka23 13',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:RailroadSwitch_20200801_014921.jpg',
    },
  },
  'aerial-gardens': {
    alt: 'Floating vegetable beds, a wooden boat and a gardener at work, seen from directly above',
    placeholder: true,
    credit: {
      author: 'Azimronnie',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Traditional_floating_vegetable_garden_34.jpg',
    },
  },
};
