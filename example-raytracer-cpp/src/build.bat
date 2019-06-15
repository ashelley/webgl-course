set CommonCompilerFlags=-Od -Zi

pushd ..\build

del *.pdb > NUL 2> NUL

cl %CommonCompilerFlags% ..\src\scratch_ray.cpp

popd