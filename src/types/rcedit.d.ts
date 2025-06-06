declare namespace Rcedit {
	type RequestedExecutionLevel =
		| "asInvoker"
		| "highestAvailable"
		| "requireAdministrator";
	interface ResourceStrings {
		[n: number]: string;
	}
	interface VersionStringOptions {
		Comments?: string;
		CompanyName?: string;
		FileDescription?: string;
		InternalFilename?: string;
		LegalCopyright?: string;
		LegalTrademarks1?: string;
		LegalTrademarks2?: string;
		OriginalFilename?: string;
		ProductName?: string;
	}
	interface Options {
		"version-string"?: VersionStringOptions;
		"file-version"?: string;
		"product-version"?: string;
		icon?: string;
		"requested-execution-level"?: RequestedExecutionLevel;
		"application-manifest"?: string;
		"resource-string"?: ResourceStrings;
	}
}
