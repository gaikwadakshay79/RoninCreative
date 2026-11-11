import { Link } from 'react-router-dom';
import { Frame } from '@/components/common/Picture';
import { categoryLabels } from '@/data/projects';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  /** Tailwind classes for the picture's ratio, for example "aspect-[4/3]". */
  ratio?: string;
  sizes: string;
  priority?: boolean;
  /** Stretches the picture to the height of its grid cell. */
  fill?: boolean;
}

/** A project as a linked picture with its title and category. */
export function ProjectCard({ project, ratio = 'aspect-[4/3]', sizes, priority, fill = false }: ProjectCardProps) {
  return (
    <Link
      to={`/portfolio/${project.slug}`}
      className={`zoom group flex flex-col no-underline ${fill ? 'h-full' : ''}`}
      aria-label={`${project.title}, ${categoryLabels[project.category]}${project.placeholder ? ', placeholder' : ''}`}
    >
      <Frame
        media={project.cover}
        sizes={sizes}
        priority={priority}
        alt=""
        frameClassName={fill ? `min-h-64 flex-1 ${ratio}` : ratio}
        slot={`project-${project.slug}`}
      />
      <div className="tile__meta">
        <h3 className="text-lg">{project.title}</h3>
        <span className="label shrink-0">
          {categoryLabels[project.category]}
          {project.placeholder ? ' · placeholder' : null}
        </span>
      </div>
    </Link>
  );
}
