import { NextResponse } from "next/server";

export function createErrorResponse(request, statusCode, errorMessage) {
  const errorUrl = new URL(`/error`, request.url);
  errorUrl.searchParams.set("code", statusCode.toString());
  errorUrl.searchParams.set("message", errorMessage);

  const response = NextResponse.redirect(errorUrl);
  response.headers.set("x-middleware-error", "true");
  response.headers.set("x-error-code", statusCode.toString());
  response.headers.set("x-error-message", errorMessage);
  return response;
}
