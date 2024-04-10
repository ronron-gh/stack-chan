import pybullet as p
import time
import pybullet_data

import pprint

from flask import *
import json

app = Flask(__name__)

def applyRotation(yaw, pitch):
  p.setGravity(0, 0, p.readUserDebugParameter(gravId))
  for i in range(len(jointIds)):
    if(jointIdName[i] == b'base_to_body'):
      targetPos = yaw
    elif(jointIdName[i] == b'body_to_head'):
      targetPos = pitch
    p.setJointMotorControl2(robot, jointIds[i], p.POSITION_CONTROL, targetPos, force=5 * 240.)


@app.route("/", methods=["POST"])
def do_POST():
  if request.method == "POST":
    data = request.data.decode('utf-8')
    data = json.loads(data)
    print(data)
    applyRotation(data['yaw'], data['pitch'])
    return "OK"
    

    
if __name__ == "__main__":

  p.connect(p.GUI)
  p.setAdditionalSearchPath(pybullet_data.getDataPath())
  robot = p.loadURDF("urdf/stackchan.urdf", [0, 0, 0], useFixedBase=True, globalScaling=0.01)

  gravId = p.addUserDebugParameter("gravity", -10, 10, -10)
  jointIds = []
  jointIdName = []
  targetPos = 0

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
      jointIdName.append(jointName)

  p.setRealTimeSimulation(1)

  #app.run(debug=True, host='localhost', port=8080, threaded=True)
  app.run(debug=False, host='localhost', port=8080, threaded=True)

  while(1):
    time.sleep(0.1)

