Set up minio config to publish bucket events via mqtt:

		"mqtt": {
			"1": {
				"enable": true,
				"broker": "tcp://broker:1883",
				"topic": "minio",
				"qos": 2,
				"username": "",
				"password": "",
				"reconnectInterval": 0,
				"keepAliveInterval": 0,
				"queueDir": "",
				"queueLimit": 10000
			}
		}
