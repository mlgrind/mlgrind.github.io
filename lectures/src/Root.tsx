import React from 'react';
import { Composition, staticFile, type CalculateMetadataFunction } from 'remotion';
import './fonts.css';
import { Lecture } from './Lecture';
import type { LectureManifest } from './types';

/** Lectures with a composition. Each needs scripts/<id>.md and `npm run narrate <id>`. */
export const LECTURES = ['transformers', 'numpy-fundamentals', 'data-preprocessing'];

type Props = { manifest: LectureManifest | null };

const metadata =
  (id: string): CalculateMetadataFunction<Props> =>
  async ({ props }) => {
    // The render script passes the manifest as input props; the Studio loads it.
    const manifest: LectureManifest =
      props.manifest ?? (await fetch(staticFile(`${id}/manifest.json`)).then((r) => r.json()));
    return {
      durationInFrames: manifest.durationInFrames,
      fps: manifest.fps,
      width: manifest.width,
      height: manifest.height,
      props: { manifest },
    };
  };

export const Root: React.FC = () => (
  <>
    {LECTURES.map((id) => (
      <Composition
        key={id}
        id={id}
        component={Lecture}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ manifest: null } as Props}
        calculateMetadata={metadata(id)}
      />
    ))}
  </>
);
