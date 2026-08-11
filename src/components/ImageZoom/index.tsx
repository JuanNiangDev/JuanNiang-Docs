import Zoom, {
  type ControlledProps,
  type UncontrolledProps,
} from 'react-medium-image-zoom';
import styles from './styles.module.css';

export type ImageZoomProps = UncontrolledProps & {
  isZoomed?: ControlledProps['isZoomed'];
  onZoomChange?: ControlledProps['onZoomChange'];
  className?: string;
  backdropClassName?: string;
};

export const ImageZoom = ({
  className,
  backdropClassName,
  ...props
}: ImageZoomProps) => (
  <div
    className={[styles.imageZoom, className].filter(Boolean).join(' ')}
  >
    <Zoom
      classDialog={[styles.dialog, backdropClassName].filter(Boolean).join(' ')}
      {...props}
    />
  </div>
);
