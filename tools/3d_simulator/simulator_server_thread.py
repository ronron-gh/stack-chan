import pybullet as p
import time
import pybullet_data

import pprint

from http.server import HTTPServer
from http.server import BaseHTTPRequestHandler
import json

import threading

class ModelData:
  def set(self, robot, jointIds, jointIdName):
    self.jointIds = jointIds 
    self.jointIdName = jointIdName
    self.robot = robot

md = ModelData()
 
def applyRotation(yaw, pitch):
  for i in range(len(md.jointIds)):
    if(md.jointIdName[i] == b'base_to_body'):
      targetPos = yaw
    elif(md.jointIdName[i] == b'body_to_head'):
      targetPos = pitch
    p.setJointMotorControl2(md.robot, md.jointIds[i], p.POSITION_CONTROL, targetPos, force=5 * 240.)

class CustomHTTPRequestHandler(BaseHTTPRequestHandler):
  def do_POST(self):
    text = self.rfile.read(int(self.headers['content-length'])).decode('utf-8')
    data = json.loads(text)
    print(data)
    applyRotation(data['yaw'], data['pitch'])

    self.send_response(200)
    self.send_header('Content-Type', 'text/plain; charset=utf-8')
    self.end_headers()
    response = "OK"
    self.wfile.write(response.encode())
    
def run_simulator():
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

  md.set(robot, jointIds, jointIdName)
  p.setRealTimeSimulation(1)

  while (1):
    p.setGravity(0, 0, p.readUserDebugParameter(gravId))
    time.sleep(0.01)

    
if __name__ == "__main__":
  thread_sim = threading.Thread(target = run_simulator)
  thread_sim.start()

  server_address = ('localhost', 8080)
  httpd = HTTPServer(server_address, CustomHTTPRequestHandler)
  httpd.serve_forever()


