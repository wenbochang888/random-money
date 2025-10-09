package com.tianya.aop.interceptor;

import com.tianya.entity.bo.ApiResponse;
import com.tianya.util.GsonUtils;
import com.tianya.util.SecretUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Enumeration;
import java.util.TreeMap;

/**
 * 签名验证拦截器
 * 基于SecretUtils实现防刷、防篡改、防重放攻击
 * 
 * @author changwenbo
 * @date 2025/10/08
 */
@Slf4j
@Component
public class SignatureInterceptor implements HandlerInterceptor {

	@Autowired
	private StringRedisTemplate stringRedisTemplate;

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		String uri = request.getRequestURI();
		
		// 只拦截/api/v1/开头的路径
		if (!uri.startsWith("/api/v1/")) {
			return true;
		}

		log.info("签名验证拦截器 - 拦截请求: URI={}, Method={}", uri, request.getMethod());

		// 获取timestamp和token参数
		String timestamp = request.getParameter("timestamp");
		String token = request.getParameter("token");

		// 收集所有请求参数
		TreeMap<String, String> paramMap = new TreeMap<>();
		Enumeration<String> parameterNames = request.getParameterNames();
		while (parameterNames.hasMoreElements()) {
			String paramName = parameterNames.nextElement();
			// 跳过token参数本身
			if ("token".equals(paramName)) {
				continue;
			}
			String paramValue = request.getParameter(paramName);
			paramMap.put(paramName, paramValue);
		}

		// 签名验证
		boolean valid = SecretUtils.extractSecret(stringRedisTemplate, timestamp, token, paramMap);

		if (!valid) {
			log.warn("签名验证失败 - URI={}, timestamp={}, token={}, params={}", 
					uri, timestamp, token, GsonUtils.toJson(paramMap));
			
			// 返回验证失败响应
			writeErrorResponse(response, "签名验证失败");
			return false;
		}

		log.info("签名验证成功 - URI={}, timestamp={}", uri, timestamp);
		return true;
	}

	/**
	 * 写入错误响应
	 */
	private void writeErrorResponse(HttpServletResponse response, String message) throws IOException {
		response.setStatus(HttpServletResponse.SC_FORBIDDEN);
		response.setContentType("application/json;charset=UTF-8");
		
		ApiResponse<Object> apiResponse = ApiResponse.failed(message);
		String jsonResponse = GsonUtils.toJson(apiResponse);
		
		PrintWriter writer = response.getWriter();
		writer.write(jsonResponse);
		writer.flush();
	}
}



package com.tianya.util;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.util.DigestUtils;

import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.TimeUnit;

public class SecretUtils {

	private static final long NONCE_DURATION = 30 * 1000L;
	private static final String SALT = "gdufe888_death_simulator_2025_secret_key_v1";

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
		map.put(SALT, SALT);
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


package com.tianya.controller.vue;

import com.tianya.entity.RankingRecord;
import com.tianya.entity.bo.ApiResponse;
import com.tianya.entity.bo.RankingQueryResult;
import com.tianya.entity.request.RankingInsertRequest;
import com.tianya.service.RankingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 死亡概率模拟器排行榜Controller
 * @author changwenbo
 * @date 2025/10/08
 */
@RequestMapping(value = "/api/v1/rankings", produces = "application/json;charset=UTF-8")
@RestController
@Slf4j
public class RankingController {

	@Autowired
	private RankingService rankingService;

	/**
	 * 插入排行记录
	 * POST /api/v1/rankings
	 */
	@PostMapping(consumes = "application/json;charset=UTF-8", produces = "application/json;charset=UTF-8")
	public ResponseEntity<ApiResponse<RankingRecord>> insertRanking(@RequestBody RankingInsertRequest request) {
		log.info("收到插入排行记录请求: userName={}, probability={}, survivalYears={}", 
				request.getUserName(), request.getProbability(), request.getSurvivalYears());

		try {
			RankingRecord record = rankingService.insertRanking(request);
			return ResponseEntity
					.status(HttpStatus.CREATED)
					.body(ApiResponse.success(record, "记录已保存"));
		} catch (IllegalArgumentException e) {
			log.warn("插入排行记录失败: {}", e.getMessage());
			return ResponseEntity
					.status(HttpStatus.BAD_REQUEST)
					.body(ApiResponse.failed(e.getMessage()));
		} catch (Exception e) {
			log.error("插入排行记录异常", e);
			return ResponseEntity
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.failed("服务器内部错误"));
		}
	}

	/**
	 * 查询特定概率的排行榜
	 * GET /api/v1/rankings?probability={probability}&limit={limit}
	 */
	@GetMapping
	public ResponseEntity<ApiResponse<RankingQueryResult>> queryByProbability(
			@RequestParam(required = true) String probability,
			@RequestParam(required = false, defaultValue = "10") Integer limit) {
		
		log.info("查询排行榜: probability={}, limit={}", probability, limit);

		try {
			RankingQueryResult result = rankingService.queryByProbability(probability, limit);
			return ResponseEntity.ok(ApiResponse.success(result, "查询成功"));
		} catch (IllegalArgumentException e) {
			log.warn("查询排行榜失败: {}", e.getMessage());
			RankingQueryResult emptyResult = new RankingQueryResult(probability, Collections.emptyList(), 0);
			return ResponseEntity
					.status(HttpStatus.BAD_REQUEST)
					.body(ApiResponse.failed(emptyResult, e.getMessage()));
		} catch (Exception e) {
			log.error("查询排行榜异常", e);
			return ResponseEntity
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.failed("服务器内部错误"));
		}
	}

	/**
	 * 查询所有概率的排行榜
	 * GET /api/v1/rankings/all?limit={limit}
	 */
	@GetMapping("/all")
	public ResponseEntity<ApiResponse<Map<String, List<RankingRecord>>>> queryAllRankings(
			@RequestParam(required = false, defaultValue = "10") Integer limit) {
		
		log.info("查询所有排行榜: limit={}", limit);

		try {
			Map<String, List<RankingRecord>> result = rankingService.queryAllRankings(limit);
			return ResponseEntity.ok(ApiResponse.success(result, "查询成功"));
		} catch (Exception e) {
			log.error("查询所有排行榜异常", e);
			return ResponseEntity
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.failed("服务器内部错误"));
		}
	}

	/**
	 * 查询用户的所有记录
	 * GET /api/v1/rankings/user/{userName}
	 */
	@GetMapping("/user/{userName}")
	public ResponseEntity<ApiResponse<List<RankingRecord>>> queryByUserName(
			@PathVariable String userName) {
		
		log.info("查询用户记录: userName={}", userName);

		try {
			List<RankingRecord> records = rankingService.queryByUserName(userName);
			
			if (records.isEmpty()) {
				return ResponseEntity.ok(ApiResponse.success(records, "该用户暂无记录"));
			}
			
			return ResponseEntity.ok(ApiResponse.success(records, "查询成功"));
		} catch (IllegalArgumentException e) {
			log.warn("查询用户记录失败: {}", e.getMessage());
			return ResponseEntity
					.status(HttpStatus.BAD_REQUEST)
					.body(ApiResponse.failed(e.getMessage()));
		} catch (Exception e) {
			log.error("查询用户记录异常", e);
			return ResponseEntity
					.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(ApiResponse.failed("服务器内部错误"));
		}
	}
}

