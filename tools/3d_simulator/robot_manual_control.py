import pybullet as p
import time

import pybullet_data

p.connect(p.GUI)
p.setAdditionalSearchPath(pybullet_data.getDataPath())
#obUids = p.loadMJCF("mjcf/humanoid.xml")
#robot = obUids[1]
#robot  = p.loadURDF("kuka_iiwa/model.urdf", [0, 0, 0], useFixedBase=True) #追加
robot = p.loadURDF("urdf/stackchan.urdf", [0, 0, 0], useFixedBase=True, globalScaling=0.01)

gravId = p.addUserDebugParameter("gravity", -10, 10, -10)
jointIds = []
paramIds = []

p.setPhysicsEngineParameter(numSolverIterations=10)
p.changeDynamics(robot, -1, linearDamping=0, angularDamping=0)

for j in range(p.getNumJoints(robot)):
  p.changeDynamics(robot, j, linearDamping=0, angularDamping=0)
  info = p.getJointInfo(robot, j)
  #print(info)
  jointName = info[1]
  jointType = info[2]
  if (jointType == p.JOINT_PRISMATIC or jointType == p.JOINT_REVOLUTE):
    jointIds.append(j)
    paramIds.append(p.addUserDebugParameter(jointName.decode("utf-8"), -4, 4, 0))

p.setRealTimeSimulation(1)
while (1):
  p.setGravity(0, 0, p.readUserDebugParameter(gravId))
  for i in range(len(paramIds)):
    c = paramIds[i]
    targetPos = p.readUserDebugParameter(c)
    p.setJointMotorControl2(robot, jointIds[i], p.POSITION_CONTROL, targetPos, force=5 * 240.)
  time.sleep(0.01)

