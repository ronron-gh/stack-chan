# 概要
pybulletによるｽﾀｯｸﾁｬﾝの3Dシミュレータです。  

- robot_manual_control.py  
  GUI上のスライダーで3Dモデルの各軸の角度を変更できます（hello world的なもの）。  
  [実行している様子(Xポストのリンク)](https://twitter.com/motoh_tw/status/1770472598734094337)

- simulator_server.py  
  PCシミュレータ上で動作しているｽﾀｯｸﾁｬﾝのファームウェアと連携し、サーボの動きを3Dモデルで確認できます。

# 使い方
※Ubuntu Linux（ネイティブ及びWSL2）で確認済み
## ①【準備】pybulletをインストール
```
$ pip install pybullet
```
※この後のプログラム実行時にnumpyが無いと言われたら、numpyもインストール
```
$ pip install numpy
```

## ②3Dシミュレータを実行
```
$ python3 robot_manual_control.py
``` 
または
```
$ python3 simulator_server.py
``` 

## ③ｽﾀｯｸﾁｬﾝのファームウェアをPC上で実行
※ここからはsimulator_server.pyを使う場合の手順です。

**(1) firmware/stackchan/manifest_local.jsonを次のように変更する。**  
- config.driver.type を"sim"に変更
- Linuxの場合は現状音が出ないため、config.tts.type を"none"に変更

```
{
    "include": [
        "./manifest.json"
    ],
    "config": {
        "tts": {
            "type": "none"
        },
        "driver": {
            "type": "sim"
        }
    }
}
```

**(2) ｽﾀｯｸﾁｬﾝのHostプログラムを実行**  

```
npm run debug --target=lin/m5stack
```
※"lin"の部分は実行する環境("mac"や"win")に読み替えてください（winは動作未確認です）。

**(3) Modを実行**  
Modを実行する場合は、Hostを実行したターミナルとは別のターミナルを開いて、次のように実行してください。

```
npm run mod --target=lin/m5stack mods/look_around/manifest.json
```



# pybulletのプログラムについて
プログラムはこちらの記事で紹介されているpybulletのサンプルコードhumanoid_manual_control.pyを参考にしています（現バージョンのpybulletには付属していない模様）。

[Pybulletでロボットアームシミュレーションをするまでの手順](https://qiita.com/Conny_Brown_jp/items/b09928bea3d63ce2a68d)

このプログラムは読み込むデータ（URDFやMJCF等）を変えるだけで他のロボット（6軸アームロボットやヒューマノイドロボット等）の表示も可能となっています。pybulletのインストール先にサンプルとしていろいろなロボットのデータが用意されています。