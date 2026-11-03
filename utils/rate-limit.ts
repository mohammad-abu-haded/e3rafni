import { getRedisValue, incrementRedisValue } from "@/services/redis.service";

enum RateLimitAction {
  LOGIN = "LOGIN",
  OTP_SEND = "OTP_SEND",
  OTP_VERIFY = "OTP_VERIFY",
}

enum IdentifierType {
  IP = "IP",
  EMAIL = "EMAIL",
}

type RateLimitConfig = {
  identifier: string;
  action: RateLimitAction;
  identifierType: IdentifierType;
};

const RATE_LIMITS = {
  [RateLimitAction.LOGIN]: {
    [IdentifierType.IP]: {
      maxAttempts: 30,
      windowSeconds: 60 * 5,
    },
    [IdentifierType.EMAIL]: {
      maxAttempts: 5,
      windowSeconds: 60 * 30,
    },
  },

  [RateLimitAction.OTP_SEND]: {
    [IdentifierType.IP]: {
      maxAttempts: 10,
      windowSeconds: 60 * 10,
    },
    [IdentifierType.EMAIL]: {
      maxAttempts: 3,
      windowSeconds: 60 * 10,
    },
  },

  [RateLimitAction.OTP_VERIFY]: {
    [IdentifierType.IP]: {
      maxAttempts: 20,
      windowSeconds: 60 * 5,
    },
    [IdentifierType.EMAIL]: {
      maxAttempts: 3,
      windowSeconds: 60 * 2,
    },
  },
} satisfies Record<
  RateLimitAction,
  Record<
    IdentifierType,
    {
      maxAttempts: number;
      windowSeconds: number;
    }
  >
>;

const getRateLimitKey = ({
  identifier,
  action,
  identifierType,
}: RateLimitConfig) => {
  return `rate-limit:${action}:${identifierType}:${identifier}`;
};

const consumeRateLimit = async ({
  identifier,
  action,
  identifierType,
}: RateLimitConfig) => {
  const key = getRateLimitKey({ identifier, action, identifierType });

  const { maxAttempts, windowSeconds } = RATE_LIMITS[action][identifierType];

  const attempts = await incrementRedisValue(key, windowSeconds);

  if (attempts === null) {
    return { success: false };
  }

  return {
    success: attempts <= maxAttempts,
  };
};

const checkRateLimit = async ({
  identifier,
  action,
  identifierType,
}: RateLimitConfig) => {
  const key = getRateLimitKey({ identifier, action, identifierType });

  const { maxAttempts } = RATE_LIMITS[action][identifierType];

  const attempts = await getRedisValue<number>(key);

  return {
    success: attempts === null || attempts < maxAttempts,
  };
};

export { consumeRateLimit, checkRateLimit, IdentifierType, RateLimitAction };
