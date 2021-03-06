// from _Future__ import annotations

// import moderngl
// import numpy as np

// from manim.constants import *
// from manim.mobject.opengl.openglMobject import OpenGLMobject
// from manim.utils.bezier import integerInterpolate, interpolate
// from manim.utils.color import *
// from manim.utils.configOps import _Data, _Uniforms
// from manim.utils.images import getFullRasterImagePath
// from manim.utils.iterables import listify
// from manim.utils.spaceOps import normalizeAlongAxis


// class OpenGLSurface(OpenGLMobject) {
//     shaderDtype = [
//         ("point", np.float32, (3,)),
//         ("duPoint", np.float32, (3,)),
//         ("dvPoint", np.float32, (3,)),
//         ("color", np.float32, (4,)),
//     ]
//     shaderFolder = "surface"

//     _Init__(
//         this,
//         uvFunc=None,
//         uRange=None,
//         vRange=None,
//         # Resolution counts number of points sampled, which for
//         # each coordinate is one more than the the number of
//         # rows/columns of approximating squares
//         resolution=None,
//         color=GREY,
//         opacity=1.0,
//         gloss=0.3,
//         shadow=0.4,
//         preferedCreationAxis=1,
//         # For du and dv steps.  Much smaller and numerical error
//         # can crop up in the shaders.
//         epsilon=1e-5,
//         renderPrimitive=moderngl.TRIANGLES,
//         depthTest=True,
//         shaderFolder=None,
//         **kwargs,
//     ) {
//         this.passedUvFunc = uvFunc
//         this.uRange = uRange if uRange is not None else (0, 1)
//         this.vRange = vRange if vRange is not None else (0, 1)
//         # Resolution counts number of points sampled, which for
//         # each coordinate is one more than the the number of
//         # rows/columns of approximating squares
//         this.resolution = resolution if resolution is not None else (101, 101)
//         this.preferedCreationAxis = preferedCreationAxis
//         # For du and dv steps.  Much smaller and numerical error
//         # can crop up in the shaders.
//         this.epsilon = epsilon

//         super()._Init__(
//             color=color,
//             opacity=opacity,
//             gloss=gloss,
//             shadow=shadow,
//             shaderFolder=shaderFolder if shaderFolder is not None else "surface",
//             renderPrimitive=renderPrimitive,
//             depthTest=depthTest,
//             **kwargs,
//         )
//         this.computeTriangleIndices()

//     uvFunc(this, u, v) {
//         # To be implemented in subclasses
//         if this.passedUvFunc:
//             return this.passedUvFunc(u, v)
//         return (u, v, 0.0)

//     initPoints(this) {
//         dim = this.dim
//         nu, nv = this.resolution
//         uRange = np.linspace(*this.uRange, nu)
//         vRange = np.linspace(*this.vRange, nv)

//         # Get three lists:
//         # - Points generated by pure uv values
//         # - Those generated by values nudged by du
//         # - Those generated by values nudged by dv
//         pointLists = []
//         for (du, dv) in [(0, 0), (this.epsilon, 0), (0, this.epsilon)]:
//             uvGrid = np.array([[[u + du, v + dv] for v in vRange] for u in uRange])
//             pointGrid = np.applyAlongAxis(lambda p: this.uvFunc(*p), 2, uvGrid)
//             pointLists.append(pointGrid.reshape((nu * nv, dim)))
//         # Rather than tracking normal vectors, the points list will hold on to the
//         # infinitesimal nudged values alongside the original values.  This way, one
//         # can perform all the manipulations they'd like to the surface, and normals
//         # are still easily recoverable.
//         this.setPoints(np.vstack(pointLists))

//     computeTriangleIndices(this) {
//         # TODO, if there is an event which changes
//         # the resolution of the surface, make sure
//         # this is called.
//         nu, nv = this.resolution
//         if nu == 0 or nv == 0:
//             this.triangleIndices = np.zeros(0, dtype=int)
//             return
//         indexGrid = np.arange(nu * nv).reshape((nu, nv))
//         indices = np.zeros(6 * (nu - 1) * (nv - 1), dtype=int)
//         indices[0::6] = indexGrid[:-1, :-1].flatten()  # Top left
//         indices[1::6] = indexGrid[+1:, :-1].flatten()  # Bottom left
//         indices[2::6] = indexGrid[:-1, +1:].flatten()  # Top right
//         indices[3::6] = indexGrid[:-1, +1:].flatten()  # Top right
//         indices[4::6] = indexGrid[+1:, :-1].flatten()  # Bottom left
//         indices[5::6] = indexGrid[+1:, +1:].flatten()  # Bottom right
//         this.triangleIndices = indices

//     getTriangleIndices(this) {
//         return this.triangleIndices

//     getSurfacePointsAndNudgedPoints(this) {
//         points = this.points
//         k = len(points) // 3
//         return points[:k], points[k : 2 * k], points[2 * k :]

//     getUnitNormals(this) {
//         sPoints, duPoints, dvPoints = this.getSurfacePointsAndNudgedPoints()
//         normals = np.cross(
//             (duPoints - sPoints) / this.epsilon,
//             (dvPoints - sPoints) / this.epsilon,
//         )
//         return normalizeAlongAxis(normals, 1)

//     pointwiseBecomePartial(this, smobject, a, b, axis=None) {
//         assert isinstance(smobject, OpenGLSurface)
//         if axis is None:
//             axis = this.preferedCreationAxis
//         if a <= 0 and b >= 1:
//             this.matchPoints(smobject)
//             return this

//         nu, nv = smobject.resolution
//         this.setPoints(
//             np.vstack(
//                 [
//                     this.getPartialPointsArray(
//                         arr.copy(),
//                         a,
//                         b,
//                         (nu, nv, 3),
//                         axis=axis,
//                     )
//                     for arr in smobject.getSurfacePointsAndNudgedPoints()
//                 ],
//             ),
//         )
//         return this

//     getPartialPointsArray(this, points, a, b, resolution, axis) {
//         if len(points) == 0:
//             return points
//         nu, nv = resolution[:2]
//         points = points.reshape(resolution)
//         maxIndex = resolution[axis] - 1
//         lowerIndex, lowerResidue = integerInterpolate(0, maxIndex, a)
//         upperIndex, upperResidue = integerInterpolate(0, maxIndex, b)
//         if axis == 0:
//             points[:lowerIndex] = interpolate(
//                 points[lowerIndex],
//                 points[lowerIndex + 1],
//                 lowerResidue,
//             )
//             points[upperIndex + 1 :] = interpolate(
//                 points[upperIndex],
//                 points[upperIndex + 1],
//                 upperResidue,
//             )
//         else:
//             shape = (nu, 1, resolution[2])
//             points[:, :lowerIndex] = interpolate(
//                 points[:, lowerIndex],
//                 points[:, lowerIndex + 1],
//                 lowerResidue,
//             ).reshape(shape)
//             points[:, upperIndex + 1 :] = interpolate(
//                 points[:, upperIndex],
//                 points[:, upperIndex + 1],
//                 upperResidue,
//             ).reshape(shape)
//         return points.reshape((nu * nv, *resolution[2:]))

//     sortFacesBackToFront(this, vect=OUT) {
//         triIs = this.triangleIndices
//         indices = list(range(len(triIs) // 3))
//         points = this.points

//         indexDot(index) {
//             return np.dot(points[triIs[3 * index]], vect)

//         indices.sort(key=indexDot)
//         for k in range(3) {
//             triIs[k::3] = triIs[k::3][indices]
//         return this

//     # For shaders
//     getShaderData(this) {
//         sPoints, duPoints, dvPoints = this.getSurfacePointsAndNudgedPoints()
//         shaderData = np.zeros(len(sPoints), dtype=this.shaderDtype)
//         if "points" not in this.lockedDataKeys:
//             shaderData["point"] = sPoints
//             shaderData["duPoint"] = duPoints
//             shaderData["dvPoint"] = dvPoints
//         this.fillInShaderColorInfo(shaderData)
//         return shaderData

//     fillInShaderColorInfo(this, shaderData) {
//         this.readDataToShader(shaderData, "color", "rgbas")
//         return shaderData

//     getShaderVertIndices(this) {
//         return this.getTriangleIndices()

//     setFillByValue(this, axes, colors) {
//         # directly copied from threeDimensions.py with some compatibility changes.
//         """Sets the color of each mobject of a parametric surface to a color relative to its z-value

//         Parameters
//         ----------
//         axes :
//             The axes for the parametric surface, which will be used to map z-values to colors.
//         colors :
//             A list of colors, ordered from lower z-values to higher z-values. If a list of tuples is passed
//             containing colors paired with numbers, then those numbers will be used as the pivots.

//         Returns
//         -------
//         :class:`~.Surface`
//             The parametric surface with a gradient applied by value. For chaining.

//         Examples
//         --------
//         .. manim:: FillByValueExample
//             :saveLastFrame:

//             class FillByValueExample(ThreeDScene) {
//                 construct(this) {
//                     resolutionFa = 42
//                     this.setCameraOrientation(phi=75 * DEGREES, theta=-120 * DEGREES)
//                     axes = ThreeDAxes(xRange=(0, 5, 1), yRange=(0, 5, 1), zRange=(-1, 1, 0.5))
//                     paramSurface(u, v) {
//                         x = u
//                         y = v
//                         z = np.sin(x) * np.cos(y)
//                         return z
//                     surfacePlane = Surface(
//                         lambda u, v: axes.c2p(u, v, paramSurface(u, v)),
//                         resolution=(resolutionFa, resolutionFa),
//                         vRange=[0, 5],
//                         uRange=[0, 5],
//                         )
//                     # surfacePlane.setStyle(fillOpacity=1)
//                     surfacePlane.setFillByValue(axes=axes, colors=[(RED, -0.4), (YELLOW, 0), (GREEN, 0.4)])
//                     this.add(axes, surfacePlane)
//         """
//         if type(colors[0]) is tuple:
//             newColors, pivots = [[i for i, j in colors], [j for i, j in colors]]
//         else:
//             newColors = colors

//             pivotMin = axes.zRange[0]
//             pivotMax = axes.zRange[1]
//             pivotFrequency = (pivotMax - pivotMin) / (len(newColors) - 1)
//             pivots = np.arange(
//                 start=pivotMin,
//                 stop=pivotMax + pivotFrequency,
//                 step=pivotFrequency,
//             )

//         for mob in this.familyMembersWithPoints() {
//             # import ipdb; ipdb.setTrace(context=7)
//             zValue = axes.pointToCoords(mob.getMidpoint())[2]
//             if zValue <= pivots[0]:
//                 mob.setColor(newColors[0])
//             elif zValue >= pivots[-1]:
//                 mob.setColor(newColors[-1])
//             else:
//                 for i, pivot in enumerate(pivots) {
//                     if pivot > zValue:
//                         colorIndex = (zValue - pivots[i - 1]) / (
//                             pivots[i] - pivots[i - 1]
//                         )
//                         colorIndex = min(colorIndex, 1)
//                         mobColor = interpolateColor(
//                             newColors[i - 1],
//                             newColors[i],
//                             colorIndex,
//                         )
//                         mob.setColor(mobColor, recurse=False)

//                         break

//         return this


// class OpenGLSurfaceGroup(OpenGLSurface) {
//     _Init__(this, *parametricSurfaces, resolution=None, **kwargs) {
//         this.resolution = (0, 0) if resolution is None else resolution
//         super()._Init__(uvFunc=None, **kwargs)
//         this.add(*parametricSurfaces)

//     initPoints(this) {
//         pass  # Needed?


// class OpenGLTexturedSurface(OpenGLSurface) {
//     shaderDtype = [
//         ("point", np.float32, (3,)),
//         ("duPoint", np.float32, (3,)),
//         ("dvPoint", np.float32, (3,)),
//         ("imCoords", np.float32, (2,)),
//         ("opacity", np.float32, (1,)),
//     ]
//     shaderFolder = "texturedSurface"
//     imCoords = _Data()
//     opacity = _Data()
//     numTextures = _Uniforms()

//     _Init__(
//         this, uvSurface, imageFile, darkImageFile=None, shaderFolder=None, **kwargs
//     ) {
//         this.uniforms = {}

//         if not isinstance(uvSurface, OpenGLSurface) {
//             raise Exception("uvSurface must be of type OpenGLSurface")
//         # Set texture information
//         if darkImageFile is None:
//             darkImageFile = imageFile
//             this.numTextures = 1
//         else:
//             this.numTextures = 2
//         texturePaths = {
//             "LightTexture": getFullRasterImagePath(imageFile),
//             "DarkTexture": getFullRasterImagePath(darkImageFile),
//         }

//         this.uvSurface = uvSurface
//         this.uvFunc = uvSurface.uvFunc
//         this.uRange = uvSurface.uRange
//         this.vRange = uvSurface.vRange
//         this.resolution = uvSurface.resolution
//         this.gloss = this.uvSurface.gloss
//         super()._Init__(texturePaths=texturePaths, **kwargs)

//     initData(this) {
//         super().initData()
//         this.imCoords = np.zeros((0, 2))
//         this.opacity = np.zeros((0, 1))

//     initPoints(this) {
//         nu, nv = this.uvSurface.resolution
//         this.setPoints(this.uvSurface.points)
//         this.imCoords = np.array(
//             [
//                 [u, v]
//                 for u in np.linspace(0, 1, nu)
//                 for v in np.linspace(1, 0, nv)  # Reverse y-direction
//             ],
//         )

//     initColors(this) {
//         this.opacity = np.array([this.uvSurface.rgbas[:, 3]])

//     setOpacity(this, opacity, recurse=True) {
//         for mob in this.getFamily(recurse) {
//             mob.opacity = np.array([[o] for o in listify(opacity)])
//         return this

//     pointwiseBecomePartial(this, tsmobject, a, b, axis=1) {
//         super().pointwiseBecomePartial(tsmobject, a, b, axis)
//         imCoords = this.imCoords
//         imCoords[:] = tsmobject.imCoords
//         if a <= 0 and b >= 1:
//             return this
//         nu, nv = tsmobject.resolution
//         imCoords[:] = this.getPartialPointsArray(imCoords, a, b, (nu, nv, 2), axis)
//         return this

//     fillInShaderColorInfo(this, shaderData) {
//         this.readDataToShader(shaderData, "opacity", "opacity")
//         this.readDataToShader(shaderData, "imCoords", "imCoords")
//         return shaderData
