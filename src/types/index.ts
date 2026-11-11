/** A key of src/data/media.ts. One key is one picture, in every size the site needs. */
export type MediaKey = string;

export interface MediaCredit {
  author: string;
  licence: string;
  /** Page that documents the file and its licence. */
  source: string;
}

export interface MediaItem {
  /** What the picture shows, written for someone who cannot see it. */
  alt: string;
  /** CSS object-position that keeps the subject in frame when the picture is cropped. */
  position?: string;
  /** True while the picture is a licensed stand-in and not Ronin Creative's own work. */
  placeholder: boolean;
  /** Required for stand-ins. Remove it once the studio's own photograph replaces the file. */
  credit?: MediaCredit;
}

export interface MediaDimensions {
  width: number;
  height: number;
  widths: number[];
}

export type ServiceId =
  | 'photography'
  | 'cinematography'
  | 'drone'
  | 'aerial-360'
  | 'infrastructure';

export type ProjectCategory =
  | 'photography'
  | 'cinematography'
  | 'aerial'
  | 'architecture'
  | '360-tours'
  | 'events';

export interface Service {
  id: ServiceId;
  title: string;
  /** One line for lists and cards. */
  summary: string;
  /** Two or three sentences for the service's own section. */
  description: string;
  offerings: string[];
  /** What the client receives, or where the work is used. */
  deliverables: string[];
  image: MediaKey;
  /** Portfolio categories that show related work. */
  related: ProjectCategory[];
  /** Set to false to hide a service that is not confirmed for launch. */
  enabled: boolean;
}

export interface ProjectVideo {
  /** Path under /public or an absolute URL to an MP4 or WebM file. */
  src: string;
  poster: MediaKey;
  title: string;
}

/** Where a 360° panorama looks when it opens. Angles in degrees. */
export interface PanoramaView {
  /** Left and right. 0 is the centre of the image, positive turns right. */
  yaw: number;
  /** Up and down. 0 is the horizon, negative looks down. */
  pitch: number;
  /** Field of view. 90 is natural, smaller zooms in. */
  fov: number;
}

export interface Panorama {
  /** Also the file name in media/panoramas/ (without its extension). */
  id: string;
  title: string;
  /** What the panorama shows, for people who cannot see it. */
  alt: string;
  view?: PanoramaView;
  /**
   * Path to a finished tour exported from the Marzipano Tool or Pano2VR, for
   * example "/tours/villa/index.html". When set, the export is shown in a
   * frame and no image in media/panoramas/ is needed, only a poster.
   */
  embed?: string;
  /**
   * A tour exported from the Marzipano Tool, shown in the site's own viewer:
   * `path` is the folder in public/ holding its data.js and tiles/, for
   * example "/tours/panshet". `north` gives, per scene id, the yaw in degrees
   * at which the scene looks north; the compass points from it (0 if unset).
   */
  tour?: { path: string; north?: Record<string, number> };
  /** For a single panorama: the yaw in degrees at which it looks north. */
  north?: number;
  /** True while the panorama is a licensed stand-in and not Ronin Creative's own work. */
  placeholder: boolean;
  credit?: MediaCredit;
}

export interface Project {
  slug: string;
  title: string;
  category: ProjectCategory;
  summary: string;
  overview?: string[];
  cover: MediaKey;
  gallery?: MediaKey[];
  video?: ProjectVideo;
  /** Id of an entry in src/data/panoramas.ts, shown in the 360° viewer on the project page. */
  panorama?: string;
  location?: string;
  year?: number;
  services: ServiceId[];
  featured?: boolean;
  /** True while the project is a stand-in study and not a delivered commission. */
  placeholder: boolean;
}

export interface Testimonial {
  quote: string;
  name: string;
  role?: string;
}

export interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  service: ServiceId | 'other';
  location?: string;
  message: string;
}

export type InquiryChannel = 'api' | 'email';

export interface InquiryResult {
  channel: InquiryChannel;
}

export interface NavItem {
  label: string;
  to: string;
}
