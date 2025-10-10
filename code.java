package com.tianya.util;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.util.DigestUtils;

import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.TimeUnit;

public class SecretUtils {

	private static final long NONCE_DURATION = 10 * 1000L;
	private static final String SALT = "da_lao_bie_zai_shua_jie_kou_le";
	private static final String SALT_V2 = "wo_de_jie_kou_bao_le";
	private static final String SALT_V3 = "shou_xia_liu_qing";

	public static boolean extractSecret(StringRedisTemplate redisService, String timestamp, String token, TreeMap<String, String> map) {
		if (StringUtils.isEmpty(timestamp) || StringUtils.isEmpty(token)) {
			return false;
		}
		long ts = NumberUtils.toLong(timestamp, 0);
		long now = System.currentTimeMillis();
		if ((now - ts) > SecretUtils.NONCE_DURATION) {
			return false;
		}

		StringBuilder sb = new StringBuilder();
		map.put("salt", SALT);
		map.put("salt_v2", SALT_V2);
		map.put("slat_v3", SALT_V3);
		for (Map.Entry<String, String> entry : map.entrySet()) {
			String key = entry.getKey();
			String value = entry.getValue();
			if (sb.length() > 0) {
				sb.append("&");
			}
			sb.append(key).append("=").append(value);
		}

		String targetToken = DigestUtils.md5DigestAsHex(sb.toString().getBytes());
		if (!token.equals(targetToken)) {
			return false;
		}

		String s = redisService.opsForValue().get(timestamp);
		if (StringUtils.isNotEmpty(s)) {
			return false;
		} else {
			redisService.opsForValue().set(timestamp, timestamp, NONCE_DURATION, TimeUnit.MILLISECONDS);
		}

		return true;
	}

}
