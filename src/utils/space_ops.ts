import {Pt3, Matrix3, $identity, $scale, $normalize, $mult, Vec3, $invert} from "./js";

/** 
 * Rotation in R^3 about a specified axis of rotation.
 */
export function rotationMatrix(angle: number, axis: Vec3) {
  const aboutZ = rotationAboutZ(angle);
  const zToAxis = zToVector(axis);
  const axisToZ = $invert(zToAxis);

  // inhomogeneous_rotation_matrix = reduce(np.dot, [z_to_axis, about_z, axis_to_z])
  // if not homogeneous:
  //     return inhomogeneous_rotation_matrix
  // else:
  //     rotation_matrix = np.eye(4)
  //     rotation_matrix[:3, :3] = inhomogeneous_rotation_matrix
  //     return rotation_matrix
}

/**
 * Returns a rotation matrix for a given angle.
 * @param angle Angle for the rotation matrix.
 */
export function rotationAboutZ(angle: number): Matrix3 {
  return [
    [Math.cos(angle), -Math.sin(angle), 0],
    [Math.sin(angle), Math.cos(angle), 0],
    [0, 0, 1]
  ]
}

/**
 * Returns some matrix in SO(3) which takes the z-axis to the (normalized) vector provided as an argument
 */
export function zToVector(vector: Pt3) {
  const norm = Math.hypot(...vector);
  if (norm === 0) {
    return $identity(3);
  }
  const v = $normalize(vector);
  const phi = Math.acos(v[2]);
  let theta: number;

  if (v[0] || v[1]) {
    // projection of vector to unit circle
    const axisProj = $normalize(v.slice(0, 2));
    theta = Math.acos(axisProj[0]);
    if (axisProj[1] < 0) {
      theta = -theta;
    }
  } else {
    theta = 0;
  }

  const phiDown: Matrix3 = [
    [Math.cos(phi), 0, Math.sin(phi)],
    [0, 1, 0],
    [-Math.sin(phi), 0, Math.cos(phi)]
  ];
  return $mult(rotationAboutZ(theta), phiDown);
}
